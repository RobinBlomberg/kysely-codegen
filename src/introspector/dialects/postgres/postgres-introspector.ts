import type {
  Kysely,
  ColumnMetadata as KyselyColumnMetaData,
  TableMetadata as KyselyTableMetadata,
} from 'kysely';
import { DEFAULT_MIGRATION_LOCK_TABLE, DEFAULT_MIGRATION_TABLE, sql } from 'kysely';
import { EnumCollection } from '../../enum-collection';
import type { IntrospectOptions } from '../../introspector';
import { Introspector } from '../../introspector';
import type { ColumnMetadata } from '../../metadata/column-metadata';
import { DatabaseMetadata } from '../../metadata/database-metadata';
import type { TableMetadata } from '../../metadata/table-metadata';
import { TableMatcher } from '../../table-matcher';
import type { PostgresDB } from './postgres-db';

export type PostgresDomainInspector = {
  rootType: string;
  typeName: string;
  typeSchema: string;
};

export type TableReference = {
  schema?: string;
  name: string;
};

export type PostgresIntrospectorOptions = {
  defaultSchemas?: string[];
  domains?: boolean;
  partitions?: boolean;
};

type PostgresRawColumnMetadata = {
  auto_incrementing: string | null;
  column: string;
  column_description: string | null;
  has_default: boolean;
  not_null: boolean;
  schema: string;
  table: string;
  table_type: string;
  type: string;
  type_schema: string;
};

export class PostgresIntrospector extends Introspector<PostgresDB> {
  protected readonly options: PostgresIntrospectorOptions;

  constructor(options?: PostgresIntrospectorOptions) {
    super();

    this.options = {
      defaultSchemas:
        options?.defaultSchemas && options.defaultSchemas.length > 0
          ? options.defaultSchemas
          : ['public'],
      domains: options?.domains ?? true,
      partitions: options?.partitions,
    };
  }

  protected override async getTables(options: IntrospectOptions<PostgresDB>) {
    // Kysely's built-in postgres introspector doesn't include materialized views (`relkind = 'm'`).
    // Replicate its query and include them.
    const { rows } = await sql<PostgresRawColumnMetadata>`
      select
        a.attname as column,
        a.attnotnull as not_null,
        a.atthasdef as has_default,
        c.relname as table,
        c.relkind as table_type,
        ns.nspname as schema,
        typ.typname as type,
        dtns.nspname as type_schema,
        col_description(a.attrelid, a.attnum) as column_description,
        pg_get_serial_sequence(
          quote_ident(ns.nspname) || '.' || quote_ident(c.relname),
          a.attname
        ) as auto_incrementing
      from pg_catalog.pg_attribute as a
      inner join pg_catalog.pg_class as c on a.attrelid = c.oid
      inner join pg_catalog.pg_namespace as ns on c.relnamespace = ns.oid
      inner join pg_catalog.pg_type as typ on a.atttypid = typ.oid
      inner join pg_catalog.pg_namespace as dtns on typ.typnamespace = dtns.oid
      where c.relkind in ('r', 'v', 'p', 'm')
        and ns.nspname !~ '^pg_'
        and ns.nspname != 'information_schema'
        and ns.nspname != 'crdb_internal'
        and has_schema_privilege(ns.nspname, 'USAGE')
        and a.attnum >= 0
        and a.attisdropped != true
        and c.relname != ${DEFAULT_MIGRATION_TABLE}
        and c.relname != ${DEFAULT_MIGRATION_LOCK_TABLE}
      order by ns.nspname, c.relname, a.attnum;
    `.execute(options.db.withoutPlugins());

    let tables = this.parseTableMetadata(rows);

    if (options.includePattern) {
      const tableMatcher = new TableMatcher(options.includePattern);
      tables = tables.filter(({ name, schema }) => tableMatcher.match(schema, name));
    }

    if (options.excludePattern) {
      const tableMatcher = new TableMatcher(options.excludePattern);
      tables = tables.filter(({ name, schema }) => !tableMatcher.match(schema, name));
    }

    return tables;
  }

  private parseTableMetadata(columns: PostgresRawColumnMetadata[]) {
    const tables = new Map<string, KyselyTableMetadata>();

    for (const column of columns) {
      const key = `${column.schema}\0${column.table}`;
      let table = tables.get(key);

      if (!table) {
        table = {
          columns: [],
          isView: column.table_type === 'v' || column.table_type === 'm',
          name: column.table,
          schema: column.schema,
        };
        tables.set(key, table);
      }

      table.columns.push({
        comment: column.column_description ?? undefined,
        dataType: column.type,
        dataTypeSchema: column.type_schema,
        hasDefaultValue: column.has_default,
        isAutoIncrementing: column.auto_incrementing !== null,
        isNullable: !column.not_null,
        name: column.column,
      });
    }

    return Array.from(tables.values());
  }

  createDatabaseMetadata({
    domains,
    enums,
    partitions,
    tables: rawTables,
  }: {
    domains: PostgresDomainInspector[];
    enums: EnumCollection;
    partitions: TableReference[];
    tables: KyselyTableMetadata[];
  }) {
    const tables = rawTables
      .map((table): TableMetadata => {
        const columns = table.columns.map((column): ColumnMetadata => {
          const dataType = this.getRootType(column, domains);
          const enumValues = enums.get(
            `${column.dataTypeSchema ?? this.options.defaultSchemas}.${dataType}`,
          );
          const isArray = dataType.startsWith('_');

          return {
            comment: column.comment ?? null,
            dataType: isArray ? dataType.slice(1) : dataType,
            dataTypeSchema: column.dataTypeSchema,
            enumValues,
            hasDefaultValue: column.hasDefaultValue,
            isArray,
            isAutoIncrementing: column.isAutoIncrementing,
            isNullable: column.isNullable,
            name: column.name,
          };
        });

        const isPartition = partitions.some((partition) => {
          return (
            partition.schema === table.schema && partition.name === table.name
          );
        });

        return {
          columns,
          isPartition,
          isView: table.isView,
          name: table.name,
          schema: table.schema,
        };
      })
      .filter((table) => {
        return this.options.partitions ? true : !table.isPartition;
      });

    return new DatabaseMetadata({ enums, tables });
  }

  getRootType(
    column: KyselyColumnMetaData,
    domains: PostgresDomainInspector[],
  ) {
    const foundDomain = domains.find((domain) => {
      return (
        domain.typeName === column.dataType &&
        domain.typeSchema === column.dataTypeSchema
      );
    });
    return foundDomain?.rootType ?? column.dataType;
  }

  async introspect(options: IntrospectOptions<PostgresDB>) {
    const tables = await this.getTables(options);

    const [domains, enums, partitions] = await Promise.all([
      this.introspectDomains(options.db),
      this.introspectEnums(options.db),
      this.introspectPartitions(options.db),
    ]);

    return this.createDatabaseMetadata({ enums, domains, partitions, tables });
  }

  async introspectDomains(db: Kysely<PostgresDB>) {
    if (!this.options.domains) {
      return [];
    }

    const result = await sql<PostgresDomainInspector>`
      with recursive domain_hierarchy as (
        select oid, typbasetype
        from pg_type
        where typtype = 'd'
        and 'information_schema'::regnamespace::oid <> typnamespace

        union all

        select dh.oid, t.typbasetype
        from domain_hierarchy as dh
        join pg_type as t ON t.oid = dh.typbasetype
      )

      select
        t.typname as "typeName",
        t.typnamespace::regnamespace::text as "typeSchema",
        bt.typname as "rootType"
      from domain_hierarchy as dh
      join pg_type as t on dh.oid = t.oid
      join pg_type as bt on dh.typbasetype = bt.oid
      where bt.typbasetype = 0;
    `.execute(db);

    return result.rows;
  }

  async introspectEnums(db: Kysely<PostgresDB>) {
    const enums = new EnumCollection();

    const rows = await db
      .withoutPlugins()
      .selectFrom('pg_type as type')
      .innerJoin('pg_enum as enum', 'type.oid', 'enum.enumtypid')
      .innerJoin(
        'pg_catalog.pg_namespace as namespace',
        'namespace.oid',
        'type.typnamespace',
      )
      .select([
        'namespace.nspname as schemaName',
        'type.typname as enumName',
        'enum.enumlabel as enumValue',
      ])
      .execute();

    for (const row of rows) {
      enums.add(`${row.schemaName}.${row.enumName}`, row.enumValue);
    }

    return enums;
  }

  async introspectPartitions(db: Kysely<PostgresDB>) {
    const result = await sql<TableReference>`
      select pg_namespace.nspname as schema, pg_class.relname as name
      from pg_inherits
      join pg_class on pg_inherits.inhrelid = pg_class.oid
      join pg_namespace on pg_namespace.oid = pg_class.relnamespace;
    `.execute(db);

    return result.rows;
  }
}

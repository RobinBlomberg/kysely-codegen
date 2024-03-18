import type {
  Kysely,
  ColumnMetadata as KyselyColumnMetaData,
  TableMetadata as KyselyTableMetadata,
} from 'kysely';
import { sql } from 'kysely';
import type { ColumnMetadata, TableMetadata } from '../../core';
import { DatabaseMetadata, EnumCollection } from '../../core';
import type { IntrospectOptions } from '../../introspector';
import { Introspector } from '../../introspector';
import type { PostgresAdapter } from './postgres-adapter';
import type { PostgresDB } from './postgres-db';

type PostgresDomainInspector = {
  typeName: string;
  typeSchema: string;
  rootType: string;
};

export type PostgresIntrospectorOptions = {
  domains: boolean;
};

export class PostgresIntrospector extends Introspector<PostgresDB> {
  readonly adapter: PostgresAdapter;
  readonly #options: PostgresIntrospectorOptions;

  constructor(
    adapter: PostgresAdapter,
    options: PostgresIntrospectorOptions = { domains: true },
  ) {
    super();
    this.adapter = adapter;
    this.#options = options;
  }

  #createDatabaseMetadata(
    tables: KyselyTableMetadata[],
    enums: EnumCollection,
    domains: PostgresDomainInspector[],
  ) {
    const tablesMetadata = tables.map(
      (table): TableMetadata => ({
        ...table,
        columns: table.columns.map((column): ColumnMetadata => {
          const dataType = this.#getRootType(column, domains);
          const isArray = dataType.startsWith('_');

          return {
            ...column,
            comment: column.comment ?? null,
            dataType: isArray ? dataType.slice(1) : dataType,
            dataTypeSchema: column.dataTypeSchema,
            enumValues: enums.get(
              `${
                column.dataTypeSchema ?? this.adapter.defaultSchema
              }.${dataType}`,
            ),
            isArray,
          };
        }),
      }),
    );
    return new DatabaseMetadata(tablesMetadata, enums);
  }

  #getRootType(
    column: KyselyColumnMetaData,
    domains: PostgresDomainInspector[],
  ) {
    const foundDomain = domains.find(
      (d) =>
        d.typeName === column.dataType &&
        d.typeSchema === column.dataTypeSchema,
    );

    return foundDomain?.rootType ?? column.dataType;
  }

  async #introspectEnums(db: Kysely<PostgresDB>) {
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

  async #introspectDomains(db: Kysely<PostgresDB>) {
    if (!this.#options.domains) {
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

  async introspect(options: IntrospectOptions<PostgresDB>) {
    const tables = await this.getTables(options);
    const [enums, domains] = await Promise.all([
      this.#introspectEnums(options.db),
      this.#introspectDomains(options.db),
    ]);
    return this.#createDatabaseMetadata(tables, enums, domains);
  }
}

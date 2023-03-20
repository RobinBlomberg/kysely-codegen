import { Kysely, TableMetadata as KyselyTableMetadata } from 'kysely';
import { EnumCollection } from '../../collections';
import { IntrospectOptions, Introspector } from '../../introspector';
import {
  ColumnMetadata,
  DatabaseMetadata,
  TableMetadata,
} from '../../metadata';
import { PostgresAdapter } from './postgres-adapter';
import { PostgresDB } from './postgres-db';

export class PostgresIntrospector extends Introspector<PostgresDB> {
  readonly adapter: PostgresAdapter;

  constructor(adapter: PostgresAdapter) {
    super();
    this.adapter = adapter;
  }

  #createDatabaseMetadata(
    tables: KyselyTableMetadata[],
    enums: EnumCollection,
  ) {
    const tablesMetadata = tables.map(
      (table): TableMetadata => ({
        ...table,
        columns: table.columns.map((column): ColumnMetadata => {
          const isArray = column.dataType.startsWith('_');

          return {
            ...column,
            dataType: isArray ? column.dataType.slice(1) : column.dataType,
            dataTypeSchema: column.dataTypeSchema,
            enumValues: enums.get(
              `${column.dataTypeSchema ?? this.adapter.defaultSchema}.${
                column.dataType
              }`,
            ),
            isArray,
          };
        }),
      }),
    );
    return new DatabaseMetadata(tablesMetadata, enums);
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

  async introspect(options: IntrospectOptions<PostgresDB>) {
    const tables = await this.getTables(options);
    const enums = await this.#introspectEnums(options.db);
    return this.#createDatabaseMetadata(tables, enums);
  }
}

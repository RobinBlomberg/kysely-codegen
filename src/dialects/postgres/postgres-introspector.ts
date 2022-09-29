import { Kysely, TableMetadata as KyselyTableMetadata } from 'kysely';
import { EnumCollection } from '../../collections';
import { IntrospectOptions, Introspector } from '../../introspector';
import { DatabaseMetadata } from '../../metadata';
import { PostgresDB } from './postgres-db';

export class PostgresIntrospector extends Introspector<PostgresDB> {
  #createDatabaseMetadata(
    tables: KyselyTableMetadata[],
    enums: EnumCollection,
  ) {
    const tablesMetadata = tables.map((table) => ({
      ...table,
      columns: table.columns.map((column) => ({
        ...column,
        enumValues: enums.get(column.dataType),
      })),
    }));
    return new DatabaseMetadata(tablesMetadata, enums);
  }

  async #introspectEnums(db: Kysely<PostgresDB>) {
    const enums = new EnumCollection();

    const rows = await db
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

  async introspect(options: IntrospectOptions) {
    const db = await this.connect(options);
    const tables = await this.getTables(db, options);
    const enums = await this.#introspectEnums(db);

    await db.destroy();

    const metadata = this.#createDatabaseMetadata(tables, enums);
    return metadata;
  }
}

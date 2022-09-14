import { Kysely, TableMetadata as KyselyTableMetadata } from 'kysely';
import { EnumCollection } from '../../enum-collection';
import { IntrospectionOptions, Introspector } from '../../introspector';
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

  async #getEnums(db: Kysely<PostgresDB>) {
    const enums = new EnumCollection();

    const rows = await db
      .selectFrom('pg_type')
      .innerJoin('pg_enum', 'pg_enum.enumtypid', 'pg_type.oid')
      .select(['pg_type.typname', 'pg_enum.enumlabel'])
      .execute();

    for (const row of rows) {
      enums.add(row.typname, row.enumlabel);
    }

    return enums;
  }

  async introspect(options: IntrospectionOptions) {
    const db = await this.connect(options);
    const tables = await this.getTables(db, options);
    const enums = await this.#getEnums(db);

    await db.destroy();

    const metadata = this.#createDatabaseMetadata(tables, enums);
    return metadata;
  }
}

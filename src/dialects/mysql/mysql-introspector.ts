import { Kysely, TableMetadata as KyselyTableMetadata } from 'kysely';
import { EnumCollection } from '../../collections';
import { IntrospectOptions, Introspector } from '../../introspector';
import { DatabaseMetadata } from '../../metadata';
import { MysqlDB } from './mysql-db';
import { MysqlParser } from './mysql-parser';

const ENUM_REGEXP = /^enum\(.*\)$/;

export class MysqlIntrospector extends Introspector<MysqlDB> {
  #createDatabaseMetadata(
    tables: KyselyTableMetadata[],
    enums: EnumCollection,
  ) {
    const tablesMetadata = tables.map((table) => ({
      ...table,
      columns: table.columns.map((column) => ({
        ...column,
        enumValues:
          column.dataType === 'enum'
            ? enums.get(`${table.schema ?? ''}.${table.name}.${column.name}`)
            : null,
      })),
    }));
    return new DatabaseMetadata(tablesMetadata, new EnumCollection());
  }

  async #introspectEnums(db: Kysely<MysqlDB>) {
    const enums = new EnumCollection();

    const rows = await db
      .withoutPlugins()
      .selectFrom('information_schema.COLUMNS')
      .select(['COLUMN_NAME', 'COLUMN_TYPE', 'TABLE_NAME', 'TABLE_SCHEMA'])
      .execute();

    for (const row of rows) {
      if (ENUM_REGEXP.test(row.COLUMN_TYPE)) {
        const key = `${row.TABLE_SCHEMA}.${row.TABLE_NAME}.${row.COLUMN_NAME}`;
        const parser = new MysqlParser(row.COLUMN_TYPE);
        const values = parser.parseEnum();
        enums.set(key, values);
      }
    }

    return enums;
  }

  async introspect(options: IntrospectOptions<MysqlDB>) {
    const tables = await this.getTables(options);
    const enums = await this.#introspectEnums(options.db);
    return this.#createDatabaseMetadata(tables, enums);
  }
}

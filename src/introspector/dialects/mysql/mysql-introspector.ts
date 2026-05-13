import type { Kysely, TableMetadata as KyselyTableMetadata } from 'kysely';
import { EnumCollection } from '../../enum-collection';
import type { IntrospectOptions } from '../../introspector';
import { Introspector } from '../../introspector';
import { DatabaseMetadata } from '../../metadata/database-metadata';
import type { MysqlDB } from './mysql-db';
import { MysqlParser } from './mysql-parser';

const ENUM_REGEXP = /^enum\(.*\)$/;

export class MysqlIntrospector extends Introspector<MysqlDB> {
  createDatabaseMetadata({
    enums,
    tableComments,
    tables: rawTables,
  }: {
    enums: EnumCollection;
    tableComments: Map<string, string>;
    tables: KyselyTableMetadata[];
  }) {
    const tables = rawTables.map((table) => ({
      ...table,
      comment: tableComments.get(`${table.schema ?? ''}.${table.name}`) ?? null,
      columns: table.columns.map((column) => ({
        ...column,
        enumValues:
          column.dataType === 'enum'
            ? enums.get(`${table.schema ?? ''}.${table.name}.${column.name}`)
            : null,
      })),
    }));
    return new DatabaseMetadata({ tables });
  }

  async introspect(options: IntrospectOptions<MysqlDB>) {
    const [tables, enums, tableComments] = await Promise.all([
      this.getTables(options),
      this.introspectEnums(options.db),
      this.introspectTableComments(options.db),
    ]);
    return this.createDatabaseMetadata({ enums, tableComments, tables });
  }

  async introspectEnums(db: Kysely<MysqlDB>) {
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

  async introspectTableComments(db: Kysely<MysqlDB>) {
    const rows = await db
      .withoutPlugins()
      .selectFrom('information_schema.TABLES')
      .select(['TABLE_SCHEMA', 'TABLE_NAME', 'TABLE_COMMENT'])
      .where('TABLE_COMMENT', '<>', '')
      .execute();

    const tableComments = new Map<string, string>();

    for (const row of rows) {
      if (row.TABLE_COMMENT) {
        tableComments.set(
          `${row.TABLE_SCHEMA}.${row.TABLE_NAME}`,
          row.TABLE_COMMENT,
        );
      }
    }

    return tableComments;
  }
}

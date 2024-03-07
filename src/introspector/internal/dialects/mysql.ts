import { MysqlDialect, type Kysely } from 'kysely';
import { createPool } from 'mysql2';
import { createIntrospectorAdapter } from '../../adapter.js';
import { EnumMap } from '../../enum-map.js';
import { factory } from '../../factory.js';
import { introspectTables } from '../../introspect-tables.js';
import { MysqlParser } from './mysql.parser.js';

type DB = {
  'information_schema.COLUMNS': {
    COLUMN_NAME: string;
    COLUMN_TYPE: string;
    TABLE_NAME: string;
    TABLE_SCHEMA: string;
  };
};

const ENUM_REGEXP = /^enum\(.*\)$/;

const introspectEnums = async (db: Kysely<DB>) => {
  const enums = new EnumMap();
  const rows = await db
    .withoutPlugins()
    .selectFrom('information_schema.COLUMNS')
    .select(['COLUMN_NAME', 'COLUMN_TYPE', 'TABLE_NAME', 'TABLE_SCHEMA'])
    .execute();

  for (const row of rows) {
    if (ENUM_REGEXP.test(row.COLUMN_TYPE)) {
      try {
        const key = `${row.TABLE_SCHEMA}.${row.TABLE_NAME}.${row.COLUMN_NAME}`;
        const values = MysqlParser.parseEnum(row.COLUMN_TYPE);
        enums.set(key, values);
      } catch {}
    }
  }

  return enums;
};

export const mysqlAdapter = createIntrospectorAdapter({
  createKyselyDialect: (options) => {
    return new MysqlDialect({
      pool: createPool({ uri: options.connectionString }),
    });
  },
  introspect: async (db, options = {}) => {
    const [enums, rawTables] = await Promise.all([
      introspectEnums(db),
      introspectTables(db, options),
    ]);

    const tables = rawTables.map((table) => {
      const columns = table.columns.map((column) => {
        const enumName = `${table.schema ?? ''}.${table.name}.${column.name}`;
        const enumValues =
          column.dataType === 'enum' ? enums.get(enumName) : [];
        return factory.createColumnSchema({ ...column, enumValues });
      });
      return factory.createTableSchema({ ...table, columns });
    });

    return factory.createDatabaseSchema({ tables });
  },
});

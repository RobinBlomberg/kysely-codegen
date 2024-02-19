import Database from 'better-sqlite3';
import { SqliteDialect } from 'kysely';
import { createAdapter } from '../../adapter.js';
import { factory } from '../../factory.js';
import { introspectTables } from '../../introspect-tables.js';

export const sqliteAdapter = createAdapter({
  createKyselyDialect: (options) => {
    return new SqliteDialect({
      database: new Database(options.connectionString),
    });
  },
  introspect: async (db, options = {}) => {
    const tables = await introspectTables(db, options);
    return factory.createDatabaseSchema({ tables });
  },
});

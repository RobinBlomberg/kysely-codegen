import { BunWorkerDialect } from 'kysely-bun-worker';
import { createAdapter } from '../../adapter.js';
import { factory } from '../../factory.js';
import { introspectTables } from '../../introspect-tables.js';

export const bunSqliteAdapter = createAdapter({
  createKyselyDialect: (options) => {
    return new BunWorkerDialect({ url: options.connectionString });
  },
  introspect: async (db, options = {}) => {
    const tables = await introspectTables(db, options);
    return factory.createDatabaseSchema({ tables });
  },
});

import { createAdapter } from '../../adapter.js';
import { factory } from '../../factory.js';
import { introspectTables } from '../../introspect-tables.js';

export const bunSqliteAdapter = createAdapter({
  createKyselyDialect: async (options) => {
    const { BunWorkerDialect } = await import('kysely-bun-worker');
    return new BunWorkerDialect({ url: options.connectionString });
  },
  introspect: async (db, options = {}) => {
    const tables = await introspectTables(db, options);
    return factory.createDatabaseSchema({ tables });
  },
});

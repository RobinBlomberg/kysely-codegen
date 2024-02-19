import { LibsqlDialect } from '@libsql/kysely-libsql';
import { createAdapter } from '../../adapter.js';
import { factory } from '../../factory.js';
import { introspectTables } from '../../introspect-tables.js';

export const libsqlAdapter = createAdapter({
  createKyselyDialect: (options) => {
    // LibSQL URLs are of the form `libsql://token@host:port/db`:
    const url = new URL(options.connectionString);

    if (!url.username) {
      return new LibsqlDialect({ url: options.connectionString });
    }

    // The token takes the place of the username in the url:
    const token = url.username;

    // Remove the token from the url to get a "normal" connection string:
    url.username = '';

    return new LibsqlDialect({ authToken: token, url: url.toString() });
  },
  introspect: async (db, options = {}) => {
    const tables = await introspectTables(db, options);
    return factory.createDatabaseSchema({ tables });
  },
});

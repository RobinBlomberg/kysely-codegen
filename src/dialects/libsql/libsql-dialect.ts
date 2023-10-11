import { CreateKyselyDialectOptions, Dialect } from '../../core';
import { LibsqlAdapter } from './libsql-adapter';
import { SqliteIntrospector } from './libsql-introspector';

export class LibSqlDialect extends Dialect {
  readonly adapter = new LibsqlAdapter();
  readonly introspector = new SqliteIntrospector();

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const { LibsqlDialect } = await import('@libsql/kysely-libsql');

    // LibSQL URLs are of the form libsql://token@host:port/db.
    const url = new URL(options.connectionString);

    if (url.username) {
      // The token takes the place of the username in the url:
      const token = url.username;

      // Remove the token from the url to get a "normal" connection string:
      url.username = '';

      return new LibsqlDialect({ authToken: token, url: url.toString() });
    }

    return new LibsqlDialect({ url: options.connectionString });
  }
}

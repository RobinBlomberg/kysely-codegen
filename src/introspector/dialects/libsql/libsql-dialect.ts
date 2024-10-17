import type { CreateKyselyDialectOptions } from '../../dialect';
import { IntrospectorDialect } from '../../dialect';
import { LibsqlIntrospector } from './libsql-introspector';

export class LibsqlIntrospectorDialect extends IntrospectorDialect {
  override readonly introspector = new LibsqlIntrospector();

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const { LibsqlDialect: KyselyLibsqlDialect } = await import(
      '@libsql/kysely-libsql'
    );

    // LibSQL URLs are of the form `libsql://token@host:port/db`:
    const url = new URL(options.connectionString);

    if (url.username) {
      // The token takes the place of the username in the url:
      const token = url.username;

      // Remove the token from the url to get a "normal" connection string:
      url.username = '';

      return new KyselyLibsqlDialect({ authToken: token, url: url.toString() });
    }

    return new KyselyLibsqlDialect({ url: options.connectionString });
  }
}

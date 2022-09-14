import { SqliteDialect as KyselySqliteDialect } from 'kysely';
import { Dialect, DriverInstantiateOptions } from '../../dialect';
import { SqliteAdapter } from './sqlite-adapter';
import { SqliteIntrospector } from './sqlite-introspector';

export class SqliteDialect extends Dialect {
  readonly adapter = new SqliteAdapter();
  readonly introspector = new SqliteIntrospector();

  async createKyselyDialect(options: DriverInstantiateOptions) {
    const { default: Database } = await import('better-sqlite3');

    return new KyselySqliteDialect({
      database: new Database(options.connectionString),
    });
  }
}

import { SqliteDialect as KyselySqliteDialect } from 'kysely';
import { Dialect, DriverInstantiateOptions } from '../../dialect';
import { SqliteAdapter } from './sqlite-adapter';

export class SqliteDialect extends Dialect {
  readonly adapter = new SqliteAdapter();

  async createKyselyDialect(options: DriverInstantiateOptions) {
    const { default: Database } = await import('better-sqlite3');

    return new KyselySqliteDialect({
      database: new Database(options.connectionString),
    });
  }
}

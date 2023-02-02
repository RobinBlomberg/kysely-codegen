import Database from 'better-sqlite3';
import { SqliteDialect as KyselySqliteDialect } from 'kysely';
import { CreateKyselyDialectOptions, Dialect } from '../../dialect';
import { SqliteAdapter } from './sqlite-adapter';
import { SqliteIntrospector } from './sqlite-introspector';

export class SqliteDialect extends Dialect {
  readonly adapter = new SqliteAdapter();
  readonly introspector = new SqliteIntrospector();

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    return new KyselySqliteDialect({
      database: new Database(options.connectionString),
    });
  }
}

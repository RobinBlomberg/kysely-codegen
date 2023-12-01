import { CreateKyselyDialectOptions, Dialect } from '../../core';
import { SqliteAdapter } from '../sqlite';
import { SqliteIntrospector } from '../sqlite/sqlite-introspector';

export class BunSqliteDialect extends Dialect {
  readonly adapter = new SqliteAdapter();
  readonly introspector = new SqliteIntrospector();

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const { BunWorkerDialect } = await import('kysely-bun-worker');

    return new BunWorkerDialect({
      url: options.connectionString,
    });
  }
}

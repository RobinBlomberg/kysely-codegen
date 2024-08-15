import type { CreateKyselyDialectOptions } from '../../introspector/dialect';
import { Dialect } from '../../introspector/dialect';
import { SqliteAdapter } from '../sqlite/sqlite-adapter';
import { SqliteIntrospector } from '../sqlite/sqlite-introspector';

export class WorkerBunSqliteDialect extends Dialect {
  readonly adapter = new SqliteAdapter();
  readonly introspector = new SqliteIntrospector();

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const { BunWorkerDialect } = await import('kysely-bun-worker');

    return new BunWorkerDialect({
      url: options.connectionString,
    });
  }
}

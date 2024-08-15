import type { CreateKyselyDialectOptions } from '../../dialect';
import { IntrospectorDialect } from '../../dialect';
import { SqliteIntrospector } from '../sqlite/sqlite-introspector';

export class WorkerBunSqliteIntrospectorDialect extends IntrospectorDialect {
  override readonly introspector = new SqliteIntrospector();

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const { BunWorkerDialect } = await import('kysely-bun-worker');

    return new BunWorkerDialect({
      url: options.connectionString,
    });
  }
}

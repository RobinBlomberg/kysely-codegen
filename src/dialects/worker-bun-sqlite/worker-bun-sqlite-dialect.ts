import { WorkerBunSqliteAdapter } from '.';
import type { CreateKyselyDialectOptions } from '../../core';
import { Dialect } from '../../core';
import { WorkerBunSqliteIntrospector } from './worker-bun-sqlite-introspector';

export class WorkerBunSqliteDialect extends Dialect {
  readonly adapter = new WorkerBunSqliteAdapter();
  readonly introspector = new WorkerBunSqliteIntrospector();

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const { BunWorkerDialect } = await import('kysely-bun-worker');

    return new BunWorkerDialect({
      url: options.connectionString,
    });
  }
}

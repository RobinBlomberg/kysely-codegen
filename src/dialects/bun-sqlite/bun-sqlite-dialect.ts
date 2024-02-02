import type { CreateKyselyDialectOptions } from '../../core';
import { Dialect } from '../../core';
import { BunSqliteAdapter } from '../bun-sqlite';
import { BunSqliteIntrospector } from './bun-sqlite-introspector';

export class BunSqliteDialect extends Dialect {
  readonly adapter = new BunSqliteAdapter();
  readonly introspector = new BunSqliteIntrospector();

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const { BunWorkerDialect } = await import('kysely-bun-worker');

    return new BunWorkerDialect({
      url: options.connectionString,
    });
  }
}

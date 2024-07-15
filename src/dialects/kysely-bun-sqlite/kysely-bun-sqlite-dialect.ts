import { KyselyBunSqliteAdapter } from '.';
import type { CreateKyselyDialectOptions } from '../../core';
import { Dialect } from '../../core';
import { KyselyBunSqliteIntrospector } from './kysely-bun-sqlite-introspector';

export class KyselyBunSqliteDialect extends Dialect {
  readonly adapter = new KyselyBunSqliteAdapter();
  readonly introspector = new KyselyBunSqliteIntrospector();

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const { BunSqliteDialect } = await import('kysely-bun-sqlite');
    const { Database } = await import('bun:sqlite')

    return new BunSqliteDialect({
        database: new Database('db.sqlite')
    })
  }
}

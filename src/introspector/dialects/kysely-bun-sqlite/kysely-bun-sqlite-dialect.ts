import type { CreateKyselyDialectOptions } from '../../dialect';
import { IntrospectorDialect } from '../../dialect';
import { KyselyBunSqliteIntrospector } from './kysely-bun-sqlite-introspector';

export class KyselyBunSqliteIntrospectorDialect extends IntrospectorDialect {
  override readonly introspector = new KyselyBunSqliteIntrospector();

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const { default: Database } = await import('bun:sqlite');
    const { BunSqliteDialect: KyselyBunSqliteDialect } = await import(
      'kysely-bun-sqlite'
    );

    return new KyselyBunSqliteDialect({
      database: new Database(options.connectionString),
    });
  }
}

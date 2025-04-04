import type { CreateKyselyDialectOptions } from '../../dialect';
import { IntrospectorDialect } from '../../dialect';
import { KyselyBunSqliteIntrospector } from './kysely-bun-sqlite-introspector';

export class KyselyBunSqliteIntrospectorDialect extends IntrospectorDialect {
  override readonly introspector = new KyselyBunSqliteIntrospector();

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    if (typeof Bun === 'undefined') {
      throw new ReferenceError(
        "Dialect 'kysely-bun-sqlite' is only available in a Bun environment.",
      );
    }

    const { default: Database } = await import('bun:sqlite');
    const { BunSqliteDialect: KyselyBunSqliteDialect } = await import(
      'kysely-bun-sqlite'
    );

    return new KyselyBunSqliteDialect({
      database: new Database(options.connectionString),
    });
  }
}

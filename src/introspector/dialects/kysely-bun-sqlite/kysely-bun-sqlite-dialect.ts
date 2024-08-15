import { IntrospectorDialect } from '../../dialect';
import { SqliteIntrospector } from '../sqlite/sqlite-introspector';

export class KyselyBunSqliteIntrospectorDialect extends IntrospectorDialect {
  override readonly introspector = new SqliteIntrospector();

  async createKyselyDialect() {
    const { BunSqliteDialect } = await import('kysely-bun-sqlite');
    const { Database } = await import('bun:sqlite');

    return new BunSqliteDialect({
      database: new Database('db.sqlite'),
    });
  }
}

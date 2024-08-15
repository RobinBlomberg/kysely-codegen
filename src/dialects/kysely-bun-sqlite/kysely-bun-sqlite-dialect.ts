import { Dialect } from '../../introspector/dialect';
import { SqliteAdapter } from '../sqlite/sqlite-adapter';
import { SqliteIntrospector } from '../sqlite/sqlite-introspector';

export class KyselyBunSqliteDialect extends Dialect {
  readonly adapter = new SqliteAdapter();
  readonly introspector = new SqliteIntrospector();

  async createKyselyDialect() {
    const { BunSqliteDialect } = await import('kysely-bun-sqlite');
    const { Database } = await import('bun:sqlite');

    return new BunSqliteDialect({
      database: new Database('db.sqlite'),
    });
  }
}

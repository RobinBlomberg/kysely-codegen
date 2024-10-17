import { SqliteDialect as KyselySqliteDialect } from 'kysely';
import type { CreateKyselyDialectOptions } from '../../dialect';
import { IntrospectorDialect } from '../../dialect';
import { SqliteIntrospector } from './sqlite-introspector';

export class SqliteIntrospectorDialect extends IntrospectorDialect {
  override readonly introspector = new SqliteIntrospector();

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const { default: Database } = await import('better-sqlite3');

    return new KyselySqliteDialect({
      database: new Database(options.connectionString),
    });
  }
}

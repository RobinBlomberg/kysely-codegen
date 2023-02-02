import { PostgresDialect as KyselyPostgresDialect } from 'kysely';
import pg from 'pg';
import { CreateKyselyDialectOptions, Dialect } from '../../dialect';
import { PostgresAdapter } from './postgres-adapter';
import { PostgresIntrospector } from './postgres-introspector';

export class PostgresDialect extends Dialect {
  readonly adapter = new PostgresAdapter();
  readonly introspector = new PostgresIntrospector();

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const { Pool } = pg;
    return new KyselyPostgresDialect({
      pool: new Pool({
        connectionString: options.connectionString,
        ssl: options.ssl ? { rejectUnauthorized: false } : false,
      }),
    });
  }
}

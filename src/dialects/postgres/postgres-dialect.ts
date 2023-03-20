import { PostgresDialect as KyselyPostgresDialect } from 'kysely';
import { CreateKyselyDialectOptions, Dialect } from '../../dialect';
import { PostgresAdapter } from './postgres-adapter';
import { PostgresIntrospector } from './postgres-introspector';

export class PostgresDialect extends Dialect {
  readonly adapter = new PostgresAdapter();
  readonly introspector = new PostgresIntrospector(this.adapter);

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const { Pool } = await import('pg');

    return new KyselyPostgresDialect({
      pool: new Pool({
        connectionString: options.connectionString,
        ssl: options.ssl ? { rejectUnauthorized: false } : false,
      }),
    });
  }
}

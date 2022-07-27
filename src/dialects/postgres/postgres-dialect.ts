import { PostgresDialect as KyselyPostgresDialect } from 'kysely';
import { Dialect, DriverInstantiateOptions } from '../../dialect';
import { PostgresAdapter } from './postgres-adapter';

export class PostgresDialect extends Dialect {
  createAdapter() {
    return new PostgresAdapter();
  }

  async createKyselyDialect(options: DriverInstantiateOptions) {
    const { Pool } = await import('pg');

    return new KyselyPostgresDialect({
      pool: new Pool({
        connectionString: options.connectionString,
        ssl: options.ssl ? { rejectUnauthorized: false } : false,
      }),
    });
  }
}

import { PostgresDialect as KyselyPostgresDialect } from 'kysely';
import type { CreateKyselyDialectOptions } from '../../core';
import { Dialect } from '../../core';
import { PostgresAdapter } from './postgres-adapter';
import { PostgresIntrospector } from './postgres-introspector';

export type PostgresDialectOptions = {
  skipDomains?: boolean;
};

export class PostgresDialect extends Dialect {
  readonly #options: PostgresDialectOptions;
  readonly adapter = new PostgresAdapter();
  readonly introspector;

  constructor(options: PostgresDialectOptions = {}) {
    super();
    this.#options = options;
    this.introspector = new PostgresIntrospector(this.adapter, this.#options);
  }

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

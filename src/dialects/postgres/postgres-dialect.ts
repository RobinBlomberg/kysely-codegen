import { PostgresDialect as KyselyPostgresDialect } from 'kysely';
import {
  DEFAULT_NUMERIC_PARSER,
  NumericParser,
} from '../../generator/core/numeric-parser';
import type { CreateKyselyDialectOptions } from '../../introspector/dialect';
import { Dialect } from '../../introspector/dialect';
import { PostgresAdapter } from './postgres-adapter';
import { PostgresIntrospector } from './postgres-introspector';

export type PostgresDialectOptions = {
  domains?: boolean;
  numericParser?: NumericParser;
  partitions?: boolean;
};

export class PostgresDialect extends Dialect {
  readonly #options: PostgresDialectOptions;
  readonly adapter: PostgresAdapter;
  readonly introspector;

  constructor(options?: PostgresDialectOptions) {
    super();

    this.#options = {
      domains: options?.domains ?? true,
      numericParser: options?.numericParser ?? DEFAULT_NUMERIC_PARSER,
    };
    this.adapter = new PostgresAdapter({
      numericParser: this.#options.numericParser,
    });
    this.introspector = new PostgresIntrospector(this.adapter, {
      domains: this.#options.domains,
      partitions: this.#options.partitions,
    });
  }

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const { Pool, types } = await import('pg');

    if (this.#options.numericParser === NumericParser.NUMBER) {
      types.setTypeParser(1700, Number);
    } else if (this.#options.numericParser === NumericParser.NUMBER_OR_STRING) {
      types.setTypeParser(1700, (value) => {
        const number = Number(value);
        return number > Number.MAX_SAFE_INTEGER ||
          number < Number.MIN_SAFE_INTEGER
          ? value
          : number;
      });
    }

    return new KyselyPostgresDialect({
      pool: new Pool({
        connectionString: options.connectionString,
        ssl: options.ssl ? { rejectUnauthorized: false } : false,
      }),
    });
  }
}

import { PostgresDialect as KyselyPostgresDialect } from 'kysely';
import type { CreateKyselyDialectOptions } from '../../dialect';
import { IntrospectorDialect } from '../../dialect';
import { DEFAULT_NUMERIC_PARSER, NumericParser } from './numeric-parser';
import { PostgresIntrospector } from './postgres-introspector';

type PostgresDialectOptions = {
  defaultSchemas?: string[];
  domains?: boolean;
  numericParser?: NumericParser;
  partitions?: boolean;
};

export class PostgresIntrospectorDialect extends IntrospectorDialect {
  protected readonly options: PostgresDialectOptions;
  override readonly introspector: PostgresIntrospector;

  constructor(options?: PostgresDialectOptions) {
    super();

    this.introspector = new PostgresIntrospector({
      defaultSchemas: options?.defaultSchemas,
      domains: options?.domains,
      partitions: options?.partitions,
    });
    this.options = {
      defaultSchemas: options?.defaultSchemas,
      domains: options?.domains ?? true,
      numericParser: options?.numericParser ?? DEFAULT_NUMERIC_PARSER,
    };
  }

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const { Pool, types } = await import('pg');

    if (this.options.numericParser === NumericParser.NUMBER) {
      types.setTypeParser(1700, Number);
    } else if (this.options.numericParser === NumericParser.NUMBER_OR_STRING) {
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

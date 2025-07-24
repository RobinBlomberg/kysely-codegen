import { PostgresDialect as KyselyPostgresDialect } from 'kysely';
import type { CreateKyselyDialectOptions } from '../../dialect';
import { IntrospectorDialect } from '../../dialect';
import type { DateParser } from './date-parser';
import { DEFAULT_DATE_PARSER } from './date-parser';
import type { NumericParser } from './numeric-parser';
import { DEFAULT_NUMERIC_PARSER } from './numeric-parser';
import { PostgresIntrospector } from './postgres-introspector';
import type { TimestampParser } from './timestamp-parser';
import { DEFAULT_TIMESTAMP_PARSER } from './timestamp-parser';

type PostgresDialectOptions = {
  dateParser?: DateParser;
  defaultSchemas?: string[];
  domains?: boolean;
  numericParser?: NumericParser;
  partitions?: boolean;
  timestampParser?: TimestampParser;
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
      dateParser: options?.dateParser ?? DEFAULT_DATE_PARSER,
      defaultSchemas: options?.defaultSchemas,
      domains: options?.domains ?? true,
      numericParser: options?.numericParser ?? DEFAULT_NUMERIC_PARSER,
      timestampParser: options?.timestampParser ?? DEFAULT_TIMESTAMP_PARSER,
    };
  }

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const { default: pg } = await import('pg');

    if (this.options.dateParser === 'string') {
      pg.types.setTypeParser(1082, (date) => date);
    }

    if (this.options.numericParser === 'number') {
      pg.types.setTypeParser(1700, Number);
    } else if (this.options.numericParser === 'number-or-string') {
      pg.types.setTypeParser(1700, (value) => {
        const number = Number(value);
        return number > Number.MAX_SAFE_INTEGER ||
          number < Number.MIN_SAFE_INTEGER
          ? value
          : number;
      });
    }

    if (this.options.timestampParser === 'string') {
      /**
       * 13234: time_stamp
       * 1114: timestamp
       * 1184: timestamptz
       */
      pg.types.setTypeParser(13234, (ts) => ts);
      pg.types.setTypeParser(1114, (ts) => ts);
      pg.types.setTypeParser(1184, (ts) => ts);
    }

    return new KyselyPostgresDialect({
      pool: new pg.Pool({
        connectionString: options.connectionString,
        ssl: options.ssl ? { rejectUnauthorized: false } : false,
      }),
    });
  }
}

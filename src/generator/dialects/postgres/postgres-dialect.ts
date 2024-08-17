import type { NumericParser } from '../../../introspector/dialects/postgres/numeric-parser';
import { PostgresIntrospectorDialect } from '../../../introspector/dialects/postgres/postgres-dialect';
import type { GeneratorDialect } from '../../dialect';
import { PostgresAdapter } from './postgres-adapter';

export type PostgresDialectOptions = {
  defaultSchema?: string;
  domains?: boolean;
  numericParser?: NumericParser;
  partitions?: boolean;
};

export class PostgresDialect
  extends PostgresIntrospectorDialect
  implements GeneratorDialect
{
  readonly adapter: PostgresAdapter;

  constructor(options?: PostgresDialectOptions) {
    super({ ...options, partitions: true });

    this.adapter = new PostgresAdapter({
      numericParser: this.options.numericParser,
    });
  }
}

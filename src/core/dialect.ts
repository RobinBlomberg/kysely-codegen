import { Dialect as KyselyDialect } from 'kysely';
import { Introspector } from '../introspector';
import { Adapter } from './adapter';

export type CreateKyselyDialectOptions = {
  connectionString: string;
  ssl?: boolean;
};

/**
 * A Dialect is the glue between the codegen and the specified database.
 */
export abstract class Dialect {
  /**
   * The adapter for the dialect.
   */
  abstract readonly adapter: Adapter;

  /**
   * The introspector for the dialect.
   */
  abstract readonly introspector: Introspector<any>;

  /**
   * Creates a Kysely dialect.
   */
  abstract createKyselyDialect(
    options: CreateKyselyDialectOptions,
  ): Promise<KyselyDialect>;
}

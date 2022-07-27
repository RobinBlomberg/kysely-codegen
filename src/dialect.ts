import { Dialect as KyselyDialect } from 'kysely';
import { Adapter } from './adapter';

export type DriverInstantiateOptions = {
  connectionString: string;
  ssl?: boolean;
};

/**
 * Specifies how to generate code for a given database dialect and library.
 */
export abstract class Dialect {
  abstract createAdapter(): Adapter;
  abstract createKyselyDialect(
    options: DriverInstantiateOptions,
  ): Promise<KyselyDialect>;
}

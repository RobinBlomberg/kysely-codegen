import { Dialect as KyselyDialect, TableMetadata } from 'kysely';
import { Adapter } from './adapter';
import { toCamelCase, toPascalCase } from './case-converter';
import { Introspector } from './introspector';

export type DriverInstantiateOptions = {
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
    options: DriverInstantiateOptions,
  ): Promise<KyselyDialect>;

  /**
   * Returns the name of the table in the exported `DB` interface.
   */
  getExportedTableName(table: TableMetadata, camelCase: boolean): string {
    return camelCase ? toCamelCase(table.name) : table.name;
  }

  /**
   * Returns the TypeScript symbol name for the given table.
   */
  getTableSymbolName(table: TableMetadata): string {
    return toPascalCase(table.name);
  }
}

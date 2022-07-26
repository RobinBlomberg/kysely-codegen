import { Dialect, TableMetadata } from 'kysely';
import { pascalCase } from './util';

export abstract class CodegenDialect {
  /**
   * Specifies which TypeScript type to use if no other type has been assigned.
   * If "defaultType" is not specified, the "unknown" type will be used.
   *
   * @example
   * ```typescript
   * export const dialect: Dialect = {
   *   defaultType: 'string';
   * };
   *
   * // Output:
   * export interface SomeTable {
   *   cidr_array: string;
   * }
   * ```
   */
  readonly defaultType?: string = 'unknown';

  /**
   * Specifies all types that should be defined as soon as they are referenced.
   * This property currently only supports object-shape definitions.
   *
   * @example
   * ```typescript
   * export const dialect: Dialect = {
   *   definitions: {
   *     Circle: {
   *       radius: 'number',
   *       x: 'number',
   *       y: 'number',
   *     },
   *   },
   * };
   *
   * // Output:
   * export interface Circle {
   *   radius: number;
   *   x: number;
   *   y: number;
   * }
   *
   * export interface SomeTable {
   *   position: Circle;
   * }
   * ```
   */
  readonly definitions?: Record<string, Record<string, string>> = {};

  /**
   * Specifies which types to import as soon as they are used.
   *
   * @example
   * ```typescript
   * export const dialect: Dialect = {
   *   imports: {
   *     IPostgresInterval: 'postgres-interval',
   *   },
   * };
   *
   * // Output:
   * import { IPostgresInterval } from 'postgres-interval';
   *
   * export interface SomeTable {
   *   frequency: IPostgresInterval;
   * }
   * ```
   */
  readonly imports?: Record<string, string> = {};

  /**
   * The name of the schema to introspect. If none is provided, all schemas will be introspected.
   */
  readonly schema?: string | null = null;

  /**
   * An object that defines which native types to map to which TypeScript types.
   * If no matching type can be found, the "defaultType" property will be used.
   *
   * @example
   * ```typescript
   * export const dialect: Dialect = {
   *   dataTypes: {
   *     bool: 'boolean',
   *     int4: 'number',
   *   },
   * };
   *
   * // Output:
   * export interface User {
   *   is_active: boolean;
   *   age: number;
   * }
   * ```
   */
  readonly types?: Record<string, string> = {};

  /**
   * Creates a Kysely dialect instance.
   */
  abstract instantiate(options: {
    connectionString: string;
    ssl: boolean;
  }): Dialect;

  /**
   * Returns the model name for the given table.
   */
  getModelName(table: TableMetadata): string {
    return pascalCase(table.name);
  }

  /**
   * Returns the name of the table in the exported `DB` interface.
   */
  getExportedTableName(table: TableMetadata): string {
    return table.name;
  }
}

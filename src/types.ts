import { Dialect as KyselyDialect } from 'kysely';

export type Dialect = {
  /**
   * Which TypeScript type to use if no other type has been assigned.
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
  defaultType?: string;
  /**
   * Which types to import as soon as they are used.
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
  imports?: Record<string, string>;
  /**
   * Creates a Kysely dialect instance.
   */
  instantiate(options: {
    connectionString: string;
    ssl: boolean;
  }): KyselyDialect;
  /**
   * Which models to define as soon as they are used. This property currently only supports
   * object-based models.
   *
   * @example
   * ```typescript
   * export const dialect: Dialect = {
   *   models: {
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
  models?: Record<string, Record<string, string>>;
  /**
   * The schema to introspect. If none is provided, all schemas will be introspected.
   */
  schema?: string;
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
  types?: Record<string, string>;
};

export type Style = 'interface' | 'type';

import type { Dialect, Kysely } from 'kysely';
import type { Adapter } from './adapter.js';
import type { EnumMap } from './enum-map.js';

export type ColumnSchema = {
  name: string;
  dataTypeSchema: string | null;
  dataType: string;
  enumValues: string[];
  hasDefaultValue: boolean;
  isArray: boolean;
  isAutoIncrementing: boolean;
  isNullable: boolean;
};

export type ConnectionCreator = (
  options: CreateConnectionOptions,
) => Promise<Kysely<any>>;

export type CreateConnectionOptions = {
  connectionString: string;
  createKyselyDialect: KyselyDialectCreator;
};

export type DatabaseSchema = {
  enums: EnumMap;
  tables: TableSchema[];
};

export type DialectConnector = (
  connectionString: string,
) => Promise<Kysely<any>>;

export type DialectIntrospector = (
  db: Kysely<any>,
  options?: DialectIntrospectionOptions,
) => Promise<DatabaseSchema>;

export type DialectIntrospectionOptions = {
  excludePattern?: string;
  includePattern?: string;
};

export type DialectName = 'libsql' | 'mysql' | 'postgres' | 'sqlite';

export type IntrospectDatabaseOptions = {
  adapters?: Record<string, Adapter>;
  db: Kysely<any> | string;
  dialect: DialectName;
  excludePattern?: string;
  includePattern?: string;
};

export type KyselyDialectCreator = (options: {
  connectionString: string;
  ssl?: boolean;
}) => Dialect | Promise<Dialect>;

export type TableSchema = {
  schema: string | null;
  name: string;
  isView: boolean;
  columns: ColumnSchema[];
};

import type { Dialect, Kysely } from 'kysely';
import type { IntrospectorAdapter } from './adapter.js';
import type { EnumMap } from './enum-map.js';

export type ColumnSchema = {
  comment: string | null;
  dataType: string;
  dataTypeSchema: string | null;
  enumValues: string[] | null;
  hasDefaultValue: boolean;
  isArray: boolean;
  isAutoIncrementing: boolean;
  isNullable: boolean;
  name: string;
};

export type ConnectionCreator = (
  options: CreateConnectionOptions,
) => Promise<Kysely<any>>;

export type CreateConnectionOptions = {
  connectionString: string;
  createKyselyDialect: KyselyDialectFactory;
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
  domains?: boolean;
  excludePattern?: string;
  includePattern?: string;
};

export type DialectName =
  | 'bun-sqlite'
  | 'libsql'
  | 'mssql'
  | 'mysql'
  | 'postgres'
  | 'sqlite';

export type IntrospectDatabaseOptions = {
  adapters?: Record<string, IntrospectorAdapter>;
  db: Kysely<any> | string;
  dialect: DialectName;
  excludePattern?: string;
  includePattern?: string;
};

export type KyselyDialectFactory = (options: {
  connectionString: string;
  ssl?: boolean;
}) => Dialect | Promise<Dialect>;

export type TableSchema = {
  schema: string | null;
  name: string;
  isView: boolean;
  columns: ColumnSchema[];
};

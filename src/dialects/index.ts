import { betterSqlite3Dialect } from './better-sqlite3';
import { pgDialect } from './pg';

export type Driver = keyof typeof DIALECT_BY_DRIVER;

export const DIALECT_BY_DRIVER = {
  'better-sqlite3': betterSqlite3Dialect,
  pg: pgDialect,
  sqlite3: betterSqlite3Dialect,
};

import type { IntrospectorAdapter } from './adapter.js';
import { bunSqliteAdapter } from './internal/dialects/bun-sqlite.js';
import { libsqlAdapter } from './internal/dialects/libsql.js';
import { mssqlAdapter } from './internal/dialects/mssql.js';
import { mysqlAdapter } from './internal/dialects/mysql.js';
import { postgresAdapter } from './internal/dialects/postgres.js';
import { sqliteAdapter } from './internal/dialects/sqlite.js';
import type { DialectName } from './types.js';

export const defaultAdapters: Record<DialectName, IntrospectorAdapter> = {
  'bun-sqlite': bunSqliteAdapter,
  libsql: libsqlAdapter,
  mssql: mssqlAdapter,
  mysql: mysqlAdapter,
  postgres: postgresAdapter,
  sqlite: sqliteAdapter,
};

export const getAdapter = (
  dialect: DialectName,
  adapters = defaultAdapters,
) => {
  return adapters[dialect];
};

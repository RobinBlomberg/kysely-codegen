import type { DialectName } from '../../introspector/index.js';
import type { Adapter } from './adapter.js';
import { libsqlAdapter } from './adapters/libsql.adapter.js';
import { mysqlAdapter } from './adapters/mysql.adapter.js';
import { postgresAdapter } from './adapters/postgres.adapter.js';
import { sqliteAdapter } from './adapters/sqlite.adapter.js';

const adapters: Record<DialectName, Adapter> = {
  libsql: libsqlAdapter,
  mysql: mysqlAdapter,
  postgres: postgresAdapter,
  sqlite: sqliteAdapter,
};

export const getAdapter = (name: DialectName): Adapter => {
  return adapters[name];
};

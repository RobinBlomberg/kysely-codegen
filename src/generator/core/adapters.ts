import type { DialectName } from '../../introspector/index.js';
import type { GeneratorAdapter } from './adapter.js';
import { bunSqliteAdapter } from './adapters/bun-sqlite.adapter.js';
import { libsqlAdapter } from './adapters/libsql.adapter.js';
import { mysqlAdapter } from './adapters/mysql.adapter.js';
import { postgresAdapter } from './adapters/postgres.adapter.js';
import { sqliteAdapter } from './adapters/sqlite.adapter.js';

const adapters: Record<DialectName, GeneratorAdapter> = {
  'bun-sqlite': bunSqliteAdapter,
  libsql: libsqlAdapter,
  mysql: mysqlAdapter,
  postgres: postgresAdapter,
  sqlite: sqliteAdapter,
};

export const getGeneratorAdapter = (name: DialectName): GeneratorAdapter => {
  return adapters[name];
};

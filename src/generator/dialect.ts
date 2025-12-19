import type { DialectName } from '../cli/config';
import { IntrospectorDialect } from '../introspector/dialect';
import type { Adapter } from './adapter';
import { KyselyBunSqliteDialect } from './dialects/kysely-bun-sqlite/kysely-bun-sqlite-dialect';
import { LibsqlDialect } from './dialects/libsql/libsql-dialect';
import { MssqlDialect } from './dialects/mssql/mssql-dialect';
import type { MysqlDialectOptions } from './dialects/mysql/mysql-dialect';
import { MysqlDialect } from './dialects/mysql/mysql-dialect';
import {
  type PostgresDialectOptions,
  PostgresDialect,
} from './dialects/postgres/postgres-dialect';
import { SqliteDialect } from './dialects/sqlite/sqlite-dialect';
import { WorkerBunSqliteDialect } from './dialects/worker-bun-sqlite/worker-bun-sqlite-dialect';

/**
 * A Dialect is the glue between the codegen and the specified database.
 */
export abstract class GeneratorDialect extends IntrospectorDialect {
  abstract readonly adapter: Adapter;
}

export type GeneratorDialectOptions = PostgresDialectOptions &
  MysqlDialectOptions;

export const getDialect = (
  name: DialectName,
  options?: GeneratorDialectOptions,
): GeneratorDialect => {
  switch (name) {
    case 'kysely-bun-sqlite':
      return new KyselyBunSqliteDialect();
    case 'libsql':
      return new LibsqlDialect();
    case 'mssql':
      return new MssqlDialect();
    case 'mysql':
      return new MysqlDialect({ dateStrings: options?.dateStrings });
    case 'postgres':
      return new PostgresDialect(options);
    case 'bun-sqlite': // Legacy.
    case 'worker-bun-sqlite':
      return new WorkerBunSqliteDialect();
    default:
      return new SqliteDialect();
  }
};

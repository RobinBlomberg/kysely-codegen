import type { NumericParser } from '../introspector/dialects/postgres/numeric-parser';
import type { GeneratorDialect } from './dialect';
import { KyselyBunSqliteDialect } from './dialects/kysely-bun-sqlite/kysely-bun-sqlite-dialect';
import { LibsqlDialect } from './dialects/libsql/libsql-dialect';
import { MssqlDialect } from './dialects/mssql/mssql-dialect';
import { MysqlDialect } from './dialects/mysql/mysql-dialect';
import { PostgresDialect } from './dialects/postgres/postgres-dialect';
import { SqliteDialect } from './dialects/sqlite/sqlite-dialect';
import { WorkerBunSqliteDialect } from './dialects/worker-bun-sqlite/worker-bun-sqlite-dialect';

export type DialectName =
  | 'bun-sqlite'
  | 'kysely-bun-sqlite'
  | 'libsql'
  | 'mssql'
  | 'mysql'
  | 'postgres'
  | 'sqlite'
  | 'worker-bun-sqlite';

export type DialectManagerOptions = {
  domains?: boolean;
  numericParser?: NumericParser;
  partitions?: boolean;
};

/**
 * Returns a dialect instance for a pre-defined dialect name.
 */
export class DialectManager {
  readonly #options: DialectManagerOptions;

  constructor(options: DialectManagerOptions) {
    this.#options = options;
  }

  getDialect(name: DialectName): GeneratorDialect {
    switch (name) {
      case 'kysely-bun-sqlite':
        return new KyselyBunSqliteDialect();
      case 'libsql':
        return new LibsqlDialect();
      case 'mssql':
        return new MssqlDialect();
      case 'mysql':
        return new MysqlDialect();
      case 'postgres':
        return new PostgresDialect(this.#options);
      case 'bun-sqlite': // Legacy.
      case 'worker-bun-sqlite':
        return new WorkerBunSqliteDialect();
      default:
        return new SqliteDialect();
    }
  }
}

import {
  KyselyBunSqliteDialect,
  LibsqlDialect,
  MssqlDialect,
  MysqlDialect,
  PostgresDialect,
  SqliteDialect,
  WorkerBunSqliteDialect,
} from '../dialects';
import type { Dialect } from './dialect';

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
  domains: boolean;
};

/**
 * Returns a dialect instance for a pre-defined dialect name.
 */
export class DialectManager {
  readonly #options: DialectManagerOptions;

  constructor(options: DialectManagerOptions = { domains: true }) {
    this.#options = options;
  }

  getDialect(name: DialectName): Dialect {
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

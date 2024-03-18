import {
  BunSqliteDialect,
  LibsqlDialect,
  MssqlDialect,
  MysqlDialect,
  PostgresDialect,
  SqliteDialect,
} from '../dialects';
import type { Dialect } from './dialect';

export type DialectName =
  | 'bun-sqlite'
  | 'libsql'
  | 'mssql'
  | 'mysql'
  | 'postgres'
  | 'sqlite';

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
      case 'bun-sqlite':
        return new BunSqliteDialect();
      case 'libsql':
        return new LibsqlDialect();
      case 'mssql':
        return new MssqlDialect();
      case 'mysql':
        return new MysqlDialect();
      case 'postgres':
        return new PostgresDialect(this.#options);
      default:
        return new SqliteDialect();
    }
  }
}

import {
  BunSqliteDialect,
  LibsqlDialect,
  MssqlDialect,
  MysqlDialect,
  PostgresDialect,
  SqliteDialect,
} from '../dialects';
import { Dialect } from './dialect';

export type DialectName =
  | 'bun-sqlite'
  | 'libsql'
  | 'mysql'
  | 'postgres'
  | 'sqlite'
  | 'mssql';

/**
 * Returns a dialect instance for a pre-defined dialect name.
 */
export class DialectManager {
  getDialect(name: DialectName): Dialect {
    switch (name) {
      case 'bun-sqlite':
        return new BunSqliteDialect();
      case 'libsql':
        return new LibsqlDialect();
      case 'mysql':
        return new MysqlDialect();
      case 'postgres':
        return new PostgresDialect();
      case 'mssql':
        return new MssqlDialect();
      default:
        return new SqliteDialect();
    }
  }
}

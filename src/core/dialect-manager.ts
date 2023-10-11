import {
  LibSqlDialect,
  MysqlDialect,
  PostgresDialect,
  SqliteDialect,
} from '../dialects';
import { Dialect } from './dialect';

export type DialectName = 'mysql' | 'postgres' | 'sqlite' | 'libsql';

/**
 * Returns a dialect instance for a pre-defined dialect name.
 */
export class DialectManager {
  getDialect(name: DialectName): Dialect {
    switch (name) {
      case 'mysql':
        return new MysqlDialect();
      case 'postgres':
        return new PostgresDialect();
      case 'libsql':
        return new LibSqlDialect();
      default:
        return new SqliteDialect();
    }
  }
}

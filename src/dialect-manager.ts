import { Dialect } from './dialect';
import { MysqlDialect, PostgresDialect, SqliteDialect } from './dialects';

export type DialectName = 'mysql' | 'postgres' | 'sqlite';

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
      default:
        return new SqliteDialect();
    }
  }
}

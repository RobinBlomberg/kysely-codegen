import { Dialect } from './dialect';
import {
  MysqlDialect,
  PlanetscaleDialect,
  PostgresDialect,
  SqliteDialect,
} from './dialects';

export type DialectName = 'mysql' | 'postgres' | 'sqlite' | 'planetscale';

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
      case 'planetscale':
        return new PlanetscaleDialect();
      default:
        return new SqliteDialect();
    }
  }
}

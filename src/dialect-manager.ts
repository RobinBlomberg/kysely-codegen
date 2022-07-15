import { CodegenDialect } from './dialect';
import { CodegenMySqlDialect } from './dialects/mysql';
import { CodegenPostgresDialect } from './dialects/postgres';
import { CodegenSqliteDialect } from './dialects/sqlite';

export type CodegenDialectName = 'postgres' | 'sqlite' | 'mysql';

export class CodegenDialectManager {
  getDialect(name: CodegenDialectName): CodegenDialect {
    switch (name) {
      case 'mysql':
        return new CodegenMySqlDialect();
      case 'postgres':
        return new CodegenPostgresDialect();
      default:
        return new CodegenSqliteDialect();
    }
  }
}

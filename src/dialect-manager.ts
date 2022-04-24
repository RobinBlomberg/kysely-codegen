import { CodegenDialect } from './dialect';
import { CodegenPostgresDialect } from './dialects/postgres';
import { CodegenSqliteDialect } from './dialects/sqlite';

export type CodegenDialectName = 'postgres' | 'sqlite';

export class CodegenDialectManager {
  getDialect(name: CodegenDialectName): CodegenDialect {
    switch (name) {
      case 'postgres':
        return new CodegenPostgresDialect();
      default:
        return new CodegenSqliteDialect();
    }
  }
}

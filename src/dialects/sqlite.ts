import { SqliteDialect } from 'kysely';
import { CodegenDialect } from '../dialect';

export class CodegenSqliteDialect extends CodegenDialect {
  override readonly defaultType = 'string';
  override readonly types = {
    ANY: 'unknown',
    BLOB: 'Buffer',
    INT: 'number',
    INTEGER: 'number',
    NUMERIC: 'number',
    REAL: 'number',
    TEXT: 'string',
  };

  instantiate(options: { connectionString: string }) {
    return new SqliteDialect({ databasePath: options.connectionString });
  }
}

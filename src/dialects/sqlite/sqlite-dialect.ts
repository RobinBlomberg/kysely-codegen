import { SqliteIntrospectorDialect } from '../../introspector/dialects/sqlite/sqlite-dialect';
import { SqliteAdapter } from './sqlite-adapter';

export class SqliteDialect extends SqliteIntrospectorDialect {
  readonly adapter = new SqliteAdapter();
}

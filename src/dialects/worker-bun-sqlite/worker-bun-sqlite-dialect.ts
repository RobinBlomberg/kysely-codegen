import { SqliteIntrospectorDialect } from '../../introspector/dialects/sqlite/sqlite-dialect';
import { SqliteAdapter } from '../sqlite/sqlite-adapter';

export class WorkerBunSqliteDialect extends SqliteIntrospectorDialect {
  readonly adapter = new SqliteAdapter();
}

import { SqliteIntrospectorDialect } from '../../introspector/dialects/sqlite/sqlite-dialect';
import { SqliteAdapter } from '../sqlite/sqlite-adapter';

export class KyselyBunSqliteDialect extends SqliteIntrospectorDialect {
  readonly adapter = new SqliteAdapter();
}

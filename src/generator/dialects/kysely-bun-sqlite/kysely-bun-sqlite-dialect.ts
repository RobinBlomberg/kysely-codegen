import { SqliteIntrospectorDialect } from '../../../introspector/dialects/sqlite/sqlite-dialect';
import type { GeneratorDialect } from '../../dialect';
import { SqliteAdapter } from '../sqlite/sqlite-adapter';

export class KyselyBunSqliteDialect
  extends SqliteIntrospectorDialect
  implements GeneratorDialect
{
  readonly adapter = new SqliteAdapter();
}

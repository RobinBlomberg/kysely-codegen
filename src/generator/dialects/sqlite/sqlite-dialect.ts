import { SqliteIntrospectorDialect } from '../../../introspector/dialects/sqlite/sqlite-dialect';
import type { GeneratorDialect } from '../../dialect';
import { SqliteAdapter } from './sqlite-adapter';

export class SqliteDialect
  extends SqliteIntrospectorDialect
  implements GeneratorDialect
{
  readonly adapter = new SqliteAdapter();
}

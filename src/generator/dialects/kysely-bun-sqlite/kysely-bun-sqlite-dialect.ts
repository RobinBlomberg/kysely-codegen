import { KyselyBunSqliteIntrospectorDialect } from '../../../introspector/dialects/kysely-bun-sqlite/kysely-bun-sqlite-dialect';
import type { GeneratorDialect } from '../../dialect';
import { KyselyBunSqliteAdapter } from './kysely-bun-sqlite-adapter';

export class KyselyBunSqliteDialect
  extends KyselyBunSqliteIntrospectorDialect
  implements GeneratorDialect
{
  readonly adapter = new KyselyBunSqliteAdapter();
}

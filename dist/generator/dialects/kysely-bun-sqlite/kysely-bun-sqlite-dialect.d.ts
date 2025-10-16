import { KyselyBunSqliteIntrospectorDialect } from '../../../introspector/dialects/kysely-bun-sqlite/kysely-bun-sqlite-dialect';
import type { GeneratorDialect } from '../../dialect';
import { KyselyBunSqliteAdapter } from './kysely-bun-sqlite-adapter';
export declare class KyselyBunSqliteDialect extends KyselyBunSqliteIntrospectorDialect implements GeneratorDialect {
    readonly adapter: KyselyBunSqliteAdapter;
}

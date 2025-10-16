import type { CreateKyselyDialectOptions } from '../../dialect';
import { IntrospectorDialect } from '../../dialect';
import { KyselyBunSqliteIntrospector } from './kysely-bun-sqlite-introspector';
export declare class KyselyBunSqliteIntrospectorDialect extends IntrospectorDialect {
    readonly introspector: KyselyBunSqliteIntrospector;
    createKyselyDialect(options: CreateKyselyDialectOptions): Promise<import("kysely-bun-sqlite").BunSqliteDialect>;
}

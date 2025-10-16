import { SqliteDialect as KyselySqliteDialect } from 'kysely';
import type { CreateKyselyDialectOptions } from '../../dialect';
import { IntrospectorDialect } from '../../dialect';
import { SqliteIntrospector } from './sqlite-introspector';
export declare class SqliteIntrospectorDialect extends IntrospectorDialect {
    readonly introspector: SqliteIntrospector;
    createKyselyDialect(options: CreateKyselyDialectOptions): Promise<KyselySqliteDialect>;
}

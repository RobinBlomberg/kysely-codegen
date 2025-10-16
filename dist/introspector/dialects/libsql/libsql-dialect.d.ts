import type { CreateKyselyDialectOptions } from '../../dialect';
import { IntrospectorDialect } from '../../dialect';
import { LibsqlIntrospector } from './libsql-introspector';
export declare class LibsqlIntrospectorDialect extends IntrospectorDialect {
    readonly introspector: LibsqlIntrospector;
    createKyselyDialect(options: CreateKyselyDialectOptions): Promise<import("@libsql/kysely-libsql").LibsqlDialect>;
}

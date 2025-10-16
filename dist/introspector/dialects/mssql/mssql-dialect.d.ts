import { MssqlDialect as KyselyMssqlDialect } from 'kysely';
import type { CreateKyselyDialectOptions } from '../../dialect';
import { IntrospectorDialect } from '../../dialect';
import { MssqlIntrospector } from './mssql-introspector';
export declare class MssqlIntrospectorDialect extends IntrospectorDialect {
    #private;
    readonly introspector: MssqlIntrospector;
    createKyselyDialect(options: CreateKyselyDialectOptions): Promise<KyselyMssqlDialect>;
}

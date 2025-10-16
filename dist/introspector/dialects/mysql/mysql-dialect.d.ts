import { MysqlDialect as KyselyMysqlDialect } from 'kysely';
import type { CreateKyselyDialectOptions } from '../../dialect';
import { IntrospectorDialect } from '../../dialect';
import { MysqlIntrospector } from './mysql-introspector';
export declare class MysqlIntrospectorDialect extends IntrospectorDialect {
    readonly introspector: MysqlIntrospector;
    createKyselyDialect(options: CreateKyselyDialectOptions): Promise<KyselyMysqlDialect>;
}

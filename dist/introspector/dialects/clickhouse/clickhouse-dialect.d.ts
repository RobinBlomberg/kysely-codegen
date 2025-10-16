import type { CreateKyselyDialectOptions } from '../../dialect';
import { IntrospectorDialect } from '../../dialect';
import { ClickHouseIntrospector } from './clickhouse-introspector';
export declare class ClickHouseIntrospectorDialect extends IntrospectorDialect {
    readonly introspector: ClickHouseIntrospector;
    constructor();
    createKyselyDialect(options: CreateKyselyDialectOptions): Promise<import("@founderpath/kysely-clickhouse").ClickhouseDialect>;
}

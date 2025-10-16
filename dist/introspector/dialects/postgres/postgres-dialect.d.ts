import { PostgresDialect as KyselyPostgresDialect } from 'kysely';
import type { CreateKyselyDialectOptions } from '../../dialect';
import { IntrospectorDialect } from '../../dialect';
import type { DateParser } from './date-parser';
import type { NumericParser } from './numeric-parser';
import { PostgresIntrospector } from './postgres-introspector';
type PostgresDialectOptions = {
    dateParser?: DateParser;
    defaultSchemas?: string[];
    domains?: boolean;
    numericParser?: NumericParser;
    partitions?: boolean;
};
export declare class PostgresIntrospectorDialect extends IntrospectorDialect {
    protected readonly options: PostgresDialectOptions;
    readonly introspector: PostgresIntrospector;
    constructor(options?: PostgresDialectOptions);
    createKyselyDialect(options: CreateKyselyDialectOptions): Promise<KyselyPostgresDialect>;
}
export {};

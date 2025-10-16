import type { DateParser } from '../../../introspector/dialects/postgres/date-parser';
import type { NumericParser } from '../../../introspector/dialects/postgres/numeric-parser';
import { PostgresIntrospectorDialect } from '../../../introspector/dialects/postgres/postgres-dialect';
import type { GeneratorDialect } from '../../dialect';
import { PostgresAdapter } from './postgres-adapter';
export type PostgresDialectOptions = {
    dateParser?: DateParser;
    defaultSchemas?: string[];
    domains?: boolean;
    numericParser?: NumericParser;
    partitions?: boolean;
};
export declare class PostgresDialect extends PostgresIntrospectorDialect implements GeneratorDialect {
    readonly adapter: PostgresAdapter;
    constructor(options?: PostgresDialectOptions);
}

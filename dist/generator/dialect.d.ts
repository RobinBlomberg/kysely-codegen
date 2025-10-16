import type { DialectName } from '../cli/config';
import { IntrospectorDialect } from '../introspector/dialect';
import type { Adapter } from './adapter';
import { type PostgresDialectOptions } from './dialects/postgres/postgres-dialect';
/**
 * A Dialect is the glue between the codegen and the specified database.
 */
export declare abstract class GeneratorDialect extends IntrospectorDialect {
    abstract readonly adapter: Adapter;
}
export declare const getDialect: (name: DialectName, options?: PostgresDialectOptions) => GeneratorDialect;

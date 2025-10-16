import type { Dialect as KyselyDialect } from 'kysely';
import type { Introspector } from './introspector';
export type CreateKyselyDialectOptions = {
    connectionString: string;
    ssl?: boolean;
};
/**
 * A Dialect is the glue between the codegen and the specified database.
 */
export declare abstract class IntrospectorDialect {
    /**
     * The introspector for the dialect.
     */
    abstract readonly introspector: Introspector<any>;
    /**
     * Creates a Kysely dialect.
     */
    abstract createKyselyDialect(options: CreateKyselyDialectOptions): Promise<KyselyDialect>;
}

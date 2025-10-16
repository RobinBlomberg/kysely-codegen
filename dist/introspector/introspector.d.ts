import { Kysely } from 'kysely';
import type { IntrospectorDialect } from './dialect';
import type { DatabaseMetadata } from './metadata/database-metadata';
type ConnectOptions = {
    connectionString: string;
    dialect: IntrospectorDialect;
};
export type IntrospectOptions<DB> = {
    db: Kysely<DB>;
    excludePattern?: string | null;
    includePattern?: string | null;
    partitions?: boolean;
};
/**
 * Analyzes and returns metadata for a connected database.
 */
export declare abstract class Introspector<DB> {
    private establishDatabaseConnection;
    connect(options: ConnectOptions): Promise<Kysely<DB>>;
    protected getTables(options: IntrospectOptions<DB>): Promise<import("kysely").TableMetadata[]>;
    abstract introspect(options: IntrospectOptions<DB>): Promise<DatabaseMetadata>;
}
export {};

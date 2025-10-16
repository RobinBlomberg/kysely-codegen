import type { Kysely } from 'kysely';
import type { IntrospectOptions } from '../../introspector';
import { Introspector } from '../../introspector';
import { DatabaseMetadata } from '../../metadata/database-metadata';
import type { ClickHouseDB } from './clickhouse-db';
type ClickHouseColumn = {
    database: string;
    table: string;
    name: string;
    type: string;
    default_kind: string;
    default_expression: string;
    comment: string;
};
type ClickHouseTable = {
    database: string;
    name: string;
    engine: string;
};
export declare class ClickHouseIntrospector extends Introspector<ClickHouseDB> {
    /**
     * Extracts the base data type from ClickHouse type strings.
     * Examples:
     *   - Nullable(String) -> String
     *   - Array(Int32) -> Int32
     *   - LowCardinality(String) -> String
     *   - Decimal(18, 2) -> Decimal
     */
    private extractBaseType;
    /**
     * Checks if a ClickHouse type is nullable.
     */
    private isNullable;
    /**
     * Checks if a ClickHouse type is an array.
     */
    private isArray;
    /**
     * Extracts enum values from Enum8 or Enum16 type strings.
     * Example: Enum8('value1' = 1, 'value2' = 2) -> ['value1', 'value2']
     */
    private extractEnumValues;
    createDatabaseMetadata({ columns, tables: rawTables, }: {
        columns: ClickHouseColumn[];
        tables: ClickHouseTable[];
    }): DatabaseMetadata;
    introspect(options: IntrospectOptions<ClickHouseDB>): Promise<DatabaseMetadata>;
    introspectColumns(db: Kysely<ClickHouseDB>): Promise<ClickHouseColumn[]>;
    introspectTables(db: Kysely<ClickHouseDB>): Promise<ClickHouseTable[]>;
}
export {};

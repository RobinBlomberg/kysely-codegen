/**
 * Type definitions for ClickHouse system tables used in introspection.
 */
export type ClickHouseDB = {
    'system.tables': {
        database: string;
        name: string;
        engine: string;
        metadata_modification_time: string;
    };
    'system.columns': {
        database: string;
        table: string;
        name: string;
        type: string;
        default_kind: string;
        default_expression: string;
        comment: string;
        is_in_partition_key: number;
        is_in_sorting_key: number;
        is_in_primary_key: number;
        is_in_sampling_key: number;
        position: number;
    };
};

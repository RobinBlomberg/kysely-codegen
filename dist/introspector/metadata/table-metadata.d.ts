import type { ColumnMetadataOptions } from './column-metadata';
import { ColumnMetadata } from './column-metadata';
export type TableMetadataOptions = {
    columns: ColumnMetadataOptions[];
    isPartition?: boolean;
    isView?: boolean;
    name: string;
    schema?: string;
};
export declare class TableMetadata {
    columns: ColumnMetadata[];
    isPartition: boolean;
    isView: boolean;
    name: string;
    schema: string | undefined;
    constructor(options: TableMetadataOptions);
}

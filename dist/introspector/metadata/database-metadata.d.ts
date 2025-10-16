import { EnumCollection } from '../enum-collection';
import type { TableMetadataOptions } from './table-metadata';
import { TableMetadata } from './table-metadata';
export type DatabaseMetadataOptions = {
    enums?: EnumCollection;
    tables: TableMetadataOptions[];
};
export declare class DatabaseMetadata {
    enums: EnumCollection;
    tables: TableMetadata[];
    constructor({ enums, tables }: DatabaseMetadataOptions);
}

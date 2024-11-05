import { EnumCollection } from '../enum-collection';
import type { TableMetadataOptions } from './table-metadata';
import { TableMetadata } from './table-metadata';

export type DatabaseMetadataOptions = {
  enums?: EnumCollection;
  tables: TableMetadataOptions[];
};

export class DatabaseMetadata {
  readonly enums: EnumCollection;
  readonly tables: TableMetadata[];

  constructor({ enums, tables }: DatabaseMetadataOptions) {
    this.enums = enums ?? new EnumCollection();
    this.tables = tables.map((table) => new TableMetadata(table));
  }
}

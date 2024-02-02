import type { EnumCollection } from '../enum-collection';
import type { TableMetadataOptions } from './table-metadata';
import { TableMetadata } from './table-metadata';

export class DatabaseMetadata {
  readonly enums: EnumCollection;
  readonly tables: TableMetadata[];

  constructor(tables: TableMetadataOptions[], enums: EnumCollection) {
    this.enums = enums;
    this.tables = tables.map((table) => new TableMetadata(table));
  }
}

import { EnumCollection } from '../collections';
import { TableMetadata, TableMetadataOptions } from './table-metadata';

export class DatabaseMetadata {
  readonly enums: EnumCollection;
  readonly tables: TableMetadata[];

  constructor(tables: TableMetadataOptions[], enums: EnumCollection) {
    this.enums = enums;
    this.tables = tables.map((table) => new TableMetadata(table));
  }
}

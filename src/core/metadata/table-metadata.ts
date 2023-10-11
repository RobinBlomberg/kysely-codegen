import { ColumnMetadata, ColumnMetadataOptions } from './column-metadata';

export type TableMetadataOptions = {
  columns: ColumnMetadataOptions[];
  name: string;
  schema?: string;
};

export class TableMetadata {
  readonly columns: ColumnMetadata[];
  readonly name: string;
  readonly schema?: string;

  constructor(options: TableMetadataOptions) {
    this.columns = options.columns.map((column) => new ColumnMetadata(column));
    this.name = options.name;
    this.schema = options.schema;
  }
}

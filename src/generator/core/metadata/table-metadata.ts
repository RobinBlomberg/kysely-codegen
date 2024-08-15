import type { ColumnMetadataOptions } from './column-metadata';
import { ColumnMetadata } from './column-metadata';

export type TableMetadataOptions = {
  columns: ColumnMetadataOptions[];
  isPartition?: boolean;
  isView?: boolean;
  name: string;
  schema?: string;
};

export class TableMetadata {
  readonly columns: ColumnMetadata[];
  readonly isPartition: boolean;
  readonly isView: boolean;
  readonly name: string;
  readonly schema: string | undefined;

  constructor(options: TableMetadataOptions) {
    this.columns = options.columns.map((column) => new ColumnMetadata(column));
    this.isPartition = !!options.isPartition;
    this.isView = !!options.isView;
    this.name = options.name;
    this.schema = options.schema;
  }
}

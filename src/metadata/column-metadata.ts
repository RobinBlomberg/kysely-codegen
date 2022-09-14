export type ColumnMetadataOptions = {
  dataType: string;
  enumValues?: string[] | null;
  hasDefaultValue: boolean;
  isAutoIncrementing: boolean;
  isNullable: boolean;
  name: string;
};

export class ColumnMetadata {
  readonly dataType: string;
  readonly enumValues: string[] | null;
  readonly hasDefaultValue: boolean;
  readonly isAutoIncrementing: boolean;
  readonly isNullable: boolean;
  readonly name: string;

  constructor(options: ColumnMetadataOptions) {
    this.dataType = options.dataType;
    this.enumValues = options.enumValues ?? null;
    this.hasDefaultValue = options.hasDefaultValue;
    this.isAutoIncrementing = options.isAutoIncrementing;
    this.isNullable = options.isNullable;
    this.name = options.name;
  }
}

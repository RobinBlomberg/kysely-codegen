export type ColumnMetadataOptions = {
  dataType: string;
  enumValues?: string[] | null;
  hasDefaultValue?: boolean;
  isAutoIncrementing?: boolean;
  isNullable?: boolean;
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
    this.hasDefaultValue = options.hasDefaultValue ?? false;
    this.isAutoIncrementing = options.isAutoIncrementing ?? false;
    this.isNullable = options.isNullable ?? false;
    this.name = options.name;
  }
}

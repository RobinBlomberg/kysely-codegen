export type ColumnMetadataOptions = {
  dataType: string;
  dataTypeSchema?: string;
  enumValues?: string[] | null;
  hasDefaultValue?: boolean;
  isArray?: boolean;
  isAutoIncrementing?: boolean;
  isNullable?: boolean;
  name: string;
};

export class ColumnMetadata {
  readonly dataType: string;
  readonly dataTypeSchema: string | undefined;
  readonly enumValues: string[] | null;
  readonly hasDefaultValue: boolean;
  readonly isArray: boolean;
  readonly isAutoIncrementing: boolean;
  readonly isNullable: boolean;
  readonly name: string;

  constructor(options: ColumnMetadataOptions) {
    this.dataType = options.dataType;
    this.dataTypeSchema = options.dataTypeSchema;
    this.enumValues = options.enumValues ?? null;
    this.hasDefaultValue = options.hasDefaultValue ?? false;
    this.isArray = options.isArray ?? false;
    this.isAutoIncrementing = options.isAutoIncrementing ?? false;
    this.isNullable = options.isNullable ?? false;
    this.name = options.name;
  }
}

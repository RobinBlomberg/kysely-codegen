export type ColumnMetadataOptions = {
  comment?: string | null;
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
  comment: string | null;
  dataType: string;
  dataTypeSchema: string | undefined;
  enumValues: string[] | null;
  hasDefaultValue: boolean;
  isArray: boolean;
  isAutoIncrementing: boolean;
  isNullable: boolean;
  name: string;

  constructor(options: ColumnMetadataOptions) {
    this.comment = options.comment ?? null;
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

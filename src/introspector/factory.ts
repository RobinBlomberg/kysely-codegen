import { EnumMap } from './enum-map.js';
import type { ColumnSchema, DatabaseSchema, TableSchema } from './types.js';

export type CreateColumnSchemaInput = {
  comment?: string | null;
  dataType: string;
  dataTypeSchema?: string | null;
  enumValues?: string[];
  hasDefaultValue?: boolean;
  isArray?: boolean;
  isAutoIncrementing?: boolean;
  isNullable?: boolean;
  name: string;
};

export type CreateDatabaseSchemaInput = {
  enums?: EnumMap;
  tables: TableSchema[];
};

export type CreateTableSchemaInput = {
  schema?: string | null;
  name: string;
  isView?: boolean;
  columns?: ColumnSchema[];
};

export const factory = {
  createColumnSchema: (input: CreateColumnSchemaInput): ColumnSchema => {
    return {
      comment: input.comment ?? null,
      dataType: input.dataType,
      dataTypeSchema: input.dataTypeSchema ?? null,
      enumValues: input.enumValues ?? [],
      hasDefaultValue: !!input.hasDefaultValue,
      isArray: !!input.isArray,
      isAutoIncrementing: !!input.isAutoIncrementing,
      isNullable: !!input.isNullable,
      name: input.name,
    };
  },
  createDatabaseSchema: (input: CreateDatabaseSchemaInput): DatabaseSchema => {
    return {
      enums: input.enums ?? new EnumMap(),
      tables: input.tables,
    };
  },
  createTableSchema: (input: CreateTableSchemaInput): TableSchema => {
    return {
      schema: input.schema ?? null,
      name: input.name,
      isView: !!input.isView,
      columns: input.columns ?? [],
    };
  },
};

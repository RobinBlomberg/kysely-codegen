import type { Kysely } from 'kysely';
import { EnumCollection } from '../../enum-collection';
import type { IntrospectOptions } from '../../introspector';
import { Introspector } from '../../introspector';
import type { ColumnMetadata } from '../../metadata/column-metadata';
import { DatabaseMetadata } from '../../metadata/database-metadata';
import type { TableMetadata } from '../../metadata/table-metadata';
import type { ClickHouseDB } from './clickhouse-db';

type ClickHouseColumn = {
  database: string;
  table: string;
  name: string;
  type: string;
  default_kind: string;
  default_expression: string;
  comment: string;
};

type ClickHouseTable = {
  database: string;
  name: string;
  engine: string;
};

const SYSTEM_DATABASES = ['system', 'information_schema', 'INFORMATION_SCHEMA'];

export class ClickHouseIntrospector extends Introspector<ClickHouseDB> {
  /**
   * Extracts the base data type from ClickHouse type strings.
   * Examples:
   *   - Nullable(String) -> String
   *   - Array(Int32) -> Int32
   *   - LowCardinality(String) -> String
   *   - Decimal(18, 2) -> Decimal
   */
  private extractBaseType(clickhouseType: string): string {
    // Handle Nullable wrapper
    const nullableMatch = clickhouseType.match(/^Nullable\((.+)\)$/);
    if (nullableMatch) {
      clickhouseType = nullableMatch[1]!;
    }

    // Handle LowCardinality wrapper
    const lowCardinalityMatch = clickhouseType.match(/^LowCardinality\((.+)\)$/);
    if (lowCardinalityMatch) {
      clickhouseType = lowCardinalityMatch[1]!;
    }

    // Handle Array wrapper
    const arrayMatch = clickhouseType.match(/^Array\((.+)\)$/);
    if (arrayMatch) {
      return this.extractBaseType(arrayMatch[1]!);
    }

    // Handle parametric types (e.g., Decimal(P,S), FixedString(N), DateTime64(P))
    const parametricMatch = clickhouseType.match(/^(\w+)\(.+\)$/);
    if (parametricMatch) {
      return parametricMatch[1]!;
    }

    return clickhouseType;
  }

  /**
   * Checks if a ClickHouse type is nullable.
   */
  private isNullable(clickhouseType: string): boolean {
    return clickhouseType.startsWith('Nullable(');
  }

  /**
   * Checks if a ClickHouse type is an array.
   */
  private isArray(clickhouseType: string): boolean {
    // Remove Nullable wrapper first
    const type = clickhouseType.replace(/^Nullable\((.+)\)$/, '$1');
    return type.startsWith('Array(');
  }

  /**
   * Extracts enum values from Enum8 or Enum16 type strings.
   * Example: Enum8('value1' = 1, 'value2' = 2) -> ['value1', 'value2']
   */
  private extractEnumValues(enumType: string): string[] | null {
    const match = enumType.match(/^Enum(?:8|16)\((.*)\)$/);
    if (!match) {
      return null;
    }

    const enumContent = match[1]!;
    const values: string[] = [];
    const regex = /'([^']+)'\s*=\s*-?\d+/g;
    let enumMatch;

    while ((enumMatch = regex.exec(enumContent)) !== null) {
      values.push(enumMatch[1]!);
    }

    return values.length > 0 ? values : null;
  }

  createDatabaseMetadata({
    columns,
    tables: rawTables,
  }: {
    columns: ClickHouseColumn[];
    tables: ClickHouseTable[];
  }) {
    const enums = new EnumCollection();

    // Group columns by table
    const columnsByTable = new Map<string, ClickHouseColumn[]>();
    for (const column of columns) {
      const key = `${column.database}.${column.table}`;
      if (!columnsByTable.has(key)) {
        columnsByTable.set(key, []);
      }
      columnsByTable.get(key)!.push(column);
    }

    const tables = rawTables.map((table): TableMetadata => {
      const tableKey = `${table.database}.${table.name}`;
      const tableColumns = columnsByTable.get(tableKey) ?? [];

      const cols = tableColumns.map((column): ColumnMetadata => {
        const baseType = this.extractBaseType(column.type);
        const enumValues = this.extractEnumValues(column.type);

        // Store enum values in collection if present
        if (enumValues) {
          const enumKey = `${column.database}.${column.table}.${column.name}`;
          enums.set(enumKey, enumValues);
        }

        return {
          comment: column.comment || null,
          dataType: baseType,
          dataTypeSchema: column.database,
          enumValues,
          hasDefaultValue: !!(
            column.default_kind || column.default_expression
          ),
          isArray: this.isArray(column.type),
          isAutoIncrementing: false, // ClickHouse doesn't have auto-increment
          isNullable: this.isNullable(column.type),
          name: column.name,
        };
      });

      // Check if it's a view (View engine family)
      const isView = table.engine.includes('View');

      return {
        columns: cols,
        isPartition: false, // ClickHouse partitions are handled differently
        isView,
        name: table.name,
        schema: table.database,
      };
    });

    return new DatabaseMetadata({ enums, tables });
  }

  async introspect(options: IntrospectOptions<ClickHouseDB>) {
    const [tables, columns] = await Promise.all([
      this.introspectTables(options.db),
      this.introspectColumns(options.db),
    ]);

    return this.createDatabaseMetadata({ columns, tables });
  }

  async introspectColumns(db: Kysely<ClickHouseDB>): Promise<ClickHouseColumn[]> {
    const result = await db
      .selectFrom('system.columns as columns')
      .select([
        'columns.database',
        'columns.table',
        'columns.name',
        'columns.type',
        'columns.default_kind',
        'columns.default_expression',
        'columns.comment',
        'columns.position',
      ])
      .where('columns.table', 'not like', '.inner%')
      .where('columns.database', 'not in', SYSTEM_DATABASES)
      .orderBy('columns.database')
      .orderBy('columns.table')
      .orderBy('columns.position')
      .execute();

    return result as ClickHouseColumn[];
  }

  async introspectTables(db: Kysely<ClickHouseDB>): Promise<ClickHouseTable[]> {
    const result = await db
      .selectFrom('system.tables as tables')
      .select(['tables.database', 'tables.name', 'tables.engine'])
      .where('tables.name', 'not like', '.inner%')
      .where('tables.database', 'not in', SYSTEM_DATABASES)
      .orderBy('tables.database')
      .orderBy('tables.name')
      .execute();

    return result as ClickHouseTable[];
  }
}

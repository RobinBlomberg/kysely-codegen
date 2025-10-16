"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickHouseIntrospector = void 0;
const enum_collection_1 = require("../../enum-collection");
const introspector_1 = require("../../introspector");
const database_metadata_1 = require("../../metadata/database-metadata");
const SYSTEM_DATABASES = ['system', 'information_schema', 'INFORMATION_SCHEMA'];
class ClickHouseIntrospector extends introspector_1.Introspector {
    /**
     * Extracts the base data type from ClickHouse type strings.
     * Examples:
     *   - Nullable(String) -> String
     *   - Array(Int32) -> Int32
     *   - LowCardinality(String) -> String
     *   - Decimal(18, 2) -> Decimal
     */
    extractBaseType(clickhouseType) {
        // Handle Nullable wrapper
        const nullableMatch = clickhouseType.match(/^Nullable\((.+)\)$/);
        if (nullableMatch) {
            clickhouseType = nullableMatch[1];
        }
        // Handle LowCardinality wrapper
        const lowCardinalityMatch = clickhouseType.match(/^LowCardinality\((.+)\)$/);
        if (lowCardinalityMatch) {
            clickhouseType = lowCardinalityMatch[1];
        }
        // Handle Array wrapper
        const arrayMatch = clickhouseType.match(/^Array\((.+)\)$/);
        if (arrayMatch) {
            return this.extractBaseType(arrayMatch[1]);
        }
        // Handle parametric types (e.g., Decimal(P,S), FixedString(N), DateTime64(P))
        const parametricMatch = clickhouseType.match(/^(\w+)\(.+\)$/);
        if (parametricMatch) {
            return parametricMatch[1];
        }
        return clickhouseType;
    }
    /**
     * Checks if a ClickHouse type is nullable.
     */
    isNullable(clickhouseType) {
        return clickhouseType.startsWith('Nullable(');
    }
    /**
     * Checks if a ClickHouse type is an array.
     */
    isArray(clickhouseType) {
        // Remove Nullable wrapper first
        const type = clickhouseType.replace(/^Nullable\((.+)\)$/, '$1');
        return type.startsWith('Array(');
    }
    /**
     * Extracts enum values from Enum8 or Enum16 type strings.
     * Example: Enum8('value1' = 1, 'value2' = 2) -> ['value1', 'value2']
     */
    extractEnumValues(enumType) {
        const match = enumType.match(/^Enum(?:8|16)\((.*)\)$/);
        if (!match) {
            return null;
        }
        const enumContent = match[1];
        const values = [];
        const regex = /'([^']+)'\s*=\s*-?\d+/g;
        let enumMatch;
        while ((enumMatch = regex.exec(enumContent)) !== null) {
            values.push(enumMatch[1]);
        }
        return values.length > 0 ? values : null;
    }
    createDatabaseMetadata({ columns, tables: rawTables, }) {
        const enums = new enum_collection_1.EnumCollection();
        // Group columns by table
        const columnsByTable = new Map();
        for (const column of columns) {
            const key = `${column.database}.${column.table}`;
            if (!columnsByTable.has(key)) {
                columnsByTable.set(key, []);
            }
            columnsByTable.get(key).push(column);
        }
        const tables = rawTables.map((table) => {
            const tableKey = `${table.database}.${table.name}`;
            const tableColumns = columnsByTable.get(tableKey) ?? [];
            const cols = tableColumns.map((column) => {
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
                    hasDefaultValue: !!(column.default_kind || column.default_expression),
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
        return new database_metadata_1.DatabaseMetadata({ enums, tables });
    }
    async introspect(options) {
        const [tables, columns] = await Promise.all([
            this.introspectTables(options.db),
            this.introspectColumns(options.db),
        ]);
        return this.createDatabaseMetadata({ columns, tables });
    }
    async introspectColumns(db) {
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
        return result;
    }
    async introspectTables(db) {
        const result = await db
            .selectFrom('system.tables as tables')
            .select(['tables.database', 'tables.name', 'tables.engine'])
            .where('tables.name', 'not like', '.inner%')
            .where('tables.database', 'not in', SYSTEM_DATABASES)
            .orderBy('tables.database')
            .orderBy('tables.name')
            .execute();
        return result;
    }
}
exports.ClickHouseIntrospector = ClickHouseIntrospector;
//# sourceMappingURL=clickhouse-introspector.js.map
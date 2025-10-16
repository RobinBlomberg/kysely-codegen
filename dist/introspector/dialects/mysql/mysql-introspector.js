"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlIntrospector = void 0;
const enum_collection_1 = require("../../enum-collection");
const introspector_1 = require("../../introspector");
const database_metadata_1 = require("../../metadata/database-metadata");
const mysql_parser_1 = require("./mysql-parser");
const ENUM_REGEXP = /^enum\(.*\)$/;
class MysqlIntrospector extends introspector_1.Introspector {
    createDatabaseMetadata({ enums, tables: rawTables, }) {
        const tables = rawTables.map((table) => ({
            ...table,
            columns: table.columns.map((column) => ({
                ...column,
                enumValues: column.dataType === 'enum'
                    ? enums.get(`${table.schema ?? ''}.${table.name}.${column.name}`)
                    : null,
            })),
        }));
        return new database_metadata_1.DatabaseMetadata({ tables });
    }
    async introspect(options) {
        const tables = await this.getTables(options);
        const enums = await this.introspectEnums(options.db);
        return this.createDatabaseMetadata({ enums, tables });
    }
    async introspectEnums(db) {
        const enums = new enum_collection_1.EnumCollection();
        const rows = await db
            .withoutPlugins()
            .selectFrom('information_schema.COLUMNS')
            .select(['COLUMN_NAME', 'COLUMN_TYPE', 'TABLE_NAME', 'TABLE_SCHEMA'])
            .execute();
        for (const row of rows) {
            if (ENUM_REGEXP.test(row.COLUMN_TYPE)) {
                const key = `${row.TABLE_SCHEMA}.${row.TABLE_NAME}.${row.COLUMN_NAME}`;
                const parser = new mysql_parser_1.MysqlParser(row.COLUMN_TYPE);
                const values = parser.parseEnum();
                enums.set(key, values);
            }
        }
        return enums;
    }
}
exports.MysqlIntrospector = MysqlIntrospector;
//# sourceMappingURL=mysql-introspector.js.map
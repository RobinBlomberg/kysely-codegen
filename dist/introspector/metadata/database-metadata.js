"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseMetadata = void 0;
const enum_collection_1 = require("../enum-collection");
const table_metadata_1 = require("./table-metadata");
class DatabaseMetadata {
    constructor({ enums, tables }) {
        this.enums = enums ?? new enum_collection_1.EnumCollection();
        this.tables = tables.map((table) => new table_metadata_1.TableMetadata(table));
    }
}
exports.DatabaseMetadata = DatabaseMetadata;
//# sourceMappingURL=database-metadata.js.map
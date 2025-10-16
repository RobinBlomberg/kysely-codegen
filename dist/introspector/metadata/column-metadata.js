"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnMetadata = void 0;
class ColumnMetadata {
    constructor(options) {
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
exports.ColumnMetadata = ColumnMetadata;
//# sourceMappingURL=column-metadata.js.map
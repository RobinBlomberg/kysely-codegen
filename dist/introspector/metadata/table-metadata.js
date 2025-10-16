"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableMetadata = void 0;
const column_metadata_1 = require("./column-metadata");
class TableMetadata {
    constructor(options) {
        this.columns = options.columns.map((column) => new column_metadata_1.ColumnMetadata(column));
        this.isPartition = !!options.isPartition;
        this.isView = !!options.isView;
        this.name = options.name;
        this.schema = options.schema;
    }
}
exports.TableMetadata = TableMetadata;
//# sourceMappingURL=table-metadata.js.map
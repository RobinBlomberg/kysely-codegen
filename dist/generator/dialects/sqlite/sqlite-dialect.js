"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteDialect = void 0;
const sqlite_dialect_1 = require("../../../introspector/dialects/sqlite/sqlite-dialect");
const sqlite_adapter_1 = require("./sqlite-adapter");
class SqliteDialect extends sqlite_dialect_1.SqliteIntrospectorDialect {
    constructor() {
        super(...arguments);
        this.adapter = new sqlite_adapter_1.SqliteAdapter();
    }
}
exports.SqliteDialect = SqliteDialect;
//# sourceMappingURL=sqlite-dialect.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LibsqlDialect = void 0;
const libsql_dialect_1 = require("../../../introspector/dialects/libsql/libsql-dialect");
const libsql_adapter_1 = require("./libsql-adapter");
class LibsqlDialect extends libsql_dialect_1.LibsqlIntrospectorDialect {
    constructor() {
        super(...arguments);
        this.adapter = new libsql_adapter_1.LibsqlAdapter();
    }
}
exports.LibsqlDialect = LibsqlDialect;
//# sourceMappingURL=libsql-dialect.js.map
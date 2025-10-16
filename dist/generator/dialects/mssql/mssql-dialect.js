"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MssqlDialect = void 0;
const mssql_dialect_1 = require("../../../introspector/dialects/mssql/mssql-dialect");
const mssql_adapter_1 = require("./mssql-adapter");
class MssqlDialect extends mssql_dialect_1.MssqlIntrospectorDialect {
    constructor() {
        super(...arguments);
        this.adapter = new mssql_adapter_1.MssqlAdapter();
    }
}
exports.MssqlDialect = MssqlDialect;
//# sourceMappingURL=mssql-dialect.js.map
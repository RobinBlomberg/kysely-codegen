"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlDialect = void 0;
const mysql_dialect_1 = require("../../../introspector/dialects/mysql/mysql-dialect");
const mysql_adapter_1 = require("./mysql-adapter");
class MysqlDialect extends mysql_dialect_1.MysqlIntrospectorDialect {
    constructor() {
        super(...arguments);
        this.adapter = new mysql_adapter_1.MysqlAdapter();
    }
}
exports.MysqlDialect = MysqlDialect;
//# sourceMappingURL=mysql-dialect.js.map
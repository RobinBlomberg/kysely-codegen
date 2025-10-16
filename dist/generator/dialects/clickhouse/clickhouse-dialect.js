"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickhouseDialect = void 0;
const clickhouse_dialect_1 = require("../../../introspector/dialects/clickhouse/clickhouse-dialect");
const clickhouse_adapter_1 = require("./clickhouse-adapter");
class ClickhouseDialect extends clickhouse_dialect_1.ClickHouseIntrospectorDialect {
    constructor() {
        super(...arguments);
        this.adapter = new clickhouse_adapter_1.ClickhouseAdapter();
    }
}
exports.ClickhouseDialect = ClickhouseDialect;
//# sourceMappingURL=clickhouse-dialect.js.map
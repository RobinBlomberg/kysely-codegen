"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MssqlAdapter = void 0;
const adapter_1 = require("../../adapter");
const identifier_node_1 = require("../../ast/identifier-node");
class MssqlAdapter extends adapter_1.Adapter {
    constructor() {
        super(...arguments);
        // https://github.com/tediousjs/tedious/tree/master/src/data-types
        this.scalars = {
            bigint: new identifier_node_1.IdentifierNode('number'),
            binary: new identifier_node_1.IdentifierNode('Buffer'),
            bit: new identifier_node_1.IdentifierNode('boolean'),
            char: new identifier_node_1.IdentifierNode('string'),
            date: new identifier_node_1.IdentifierNode('Date'),
            datetime: new identifier_node_1.IdentifierNode('Date'),
            datetime2: new identifier_node_1.IdentifierNode('Date'),
            datetimeoffset: new identifier_node_1.IdentifierNode('Date'),
            decimal: new identifier_node_1.IdentifierNode('number'),
            double: new identifier_node_1.IdentifierNode('number'),
            float: new identifier_node_1.IdentifierNode('number'),
            image: new identifier_node_1.IdentifierNode('Buffer'),
            int: new identifier_node_1.IdentifierNode('number'),
            money: new identifier_node_1.IdentifierNode('number'),
            nchar: new identifier_node_1.IdentifierNode('string'),
            ntext: new identifier_node_1.IdentifierNode('string'),
            number: new identifier_node_1.IdentifierNode('number'),
            numeric: new identifier_node_1.IdentifierNode('number'),
            nvarchar: new identifier_node_1.IdentifierNode('string'),
            real: new identifier_node_1.IdentifierNode('number'),
            smalldatetime: new identifier_node_1.IdentifierNode('Date'),
            smallint: new identifier_node_1.IdentifierNode('number'),
            smallmoney: new identifier_node_1.IdentifierNode('number'),
            text: new identifier_node_1.IdentifierNode('string'),
            time: new identifier_node_1.IdentifierNode('Date'),
            tinyint: new identifier_node_1.IdentifierNode('number'),
            tvp: new identifier_node_1.IdentifierNode('unknown'),
            uniqueidentifier: new identifier_node_1.IdentifierNode('string'),
            varbinary: new identifier_node_1.IdentifierNode('Buffer'),
            varchar: new identifier_node_1.IdentifierNode('string'),
        };
    }
}
exports.MssqlAdapter = MssqlAdapter;
//# sourceMappingURL=mssql-adapter.js.map
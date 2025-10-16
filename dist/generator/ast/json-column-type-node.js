"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonColumnTypeNode = void 0;
const generic_expression_node_1 = require("./generic-expression-node");
class JsonColumnTypeNode extends generic_expression_node_1.GenericExpressionNode {
    constructor(selectType, ...args) {
        super('JSONColumnType', [selectType, ...args]);
    }
}
exports.JsonColumnTypeNode = JsonColumnTypeNode;
//# sourceMappingURL=json-column-type-node.js.map
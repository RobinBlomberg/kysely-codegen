"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnTypeNode = void 0;
const generic_expression_node_1 = require("./generic-expression-node");
class ColumnTypeNode extends generic_expression_node_1.GenericExpressionNode {
    constructor(selectType, ...insertAndUpdateTypes) {
        super('ColumnType', [selectType, ...insertAndUpdateTypes]);
    }
}
exports.ColumnTypeNode = ColumnTypeNode;
//# sourceMappingURL=column-type-node.js.map
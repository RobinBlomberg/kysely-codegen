import type { ExpressionNode } from './expression-node';
import { GenericExpressionNode } from './generic-expression-node';
export declare class ColumnTypeNode extends GenericExpressionNode {
    constructor(selectType: ExpressionNode, ...insertAndUpdateTypes: [] | [insertType: ExpressionNode] | [insertType: ExpressionNode, updateType: ExpressionNode]);
}

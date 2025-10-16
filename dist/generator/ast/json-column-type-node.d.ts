import type { ExpressionNode } from './expression-node';
import { GenericExpressionNode } from './generic-expression-node';
export declare class JsonColumnTypeNode extends GenericExpressionNode {
    constructor(selectType: ExpressionNode, ...args: [] | [insertType: ExpressionNode] | [insertType: ExpressionNode, updateType: ExpressionNode]);
}

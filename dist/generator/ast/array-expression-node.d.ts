import type { ExpressionNode } from './expression-node';
export declare class ArrayExpressionNode {
    readonly type = "ArrayExpression";
    readonly values: ExpressionNode;
    constructor(values: ExpressionNode);
}

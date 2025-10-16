import type { ExpressionNode } from './expression-node';
export declare class UnionExpressionNode {
    readonly args: ExpressionNode[];
    readonly type = "UnionExpression";
    constructor(args: ExpressionNode[]);
}

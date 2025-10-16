import type { ExpressionNode } from './expression-node';
export declare class GenericExpressionNode {
    readonly args: ExpressionNode[];
    readonly name: string;
    readonly type = "GenericExpression";
    constructor(name: string, args: ExpressionNode[]);
}

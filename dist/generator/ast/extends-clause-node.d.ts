import type { ExpressionNode } from './expression-node';
export declare class ExtendsClauseNode {
    readonly checkType: ExpressionNode;
    readonly extendsType: ExpressionNode;
    readonly trueType: ExpressionNode;
    readonly falseType: ExpressionNode;
    readonly type = "ExtendsClause";
    constructor(checkType: ExpressionNode, extendsType: ExpressionNode, trueType: ExpressionNode, falseType: ExpressionNode);
}

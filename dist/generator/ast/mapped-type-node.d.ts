import type { ExpressionNode } from './expression-node';
export declare class MappedTypeNode {
    readonly type = "MappedType";
    readonly value: ExpressionNode;
    constructor(value: ExpressionNode);
}

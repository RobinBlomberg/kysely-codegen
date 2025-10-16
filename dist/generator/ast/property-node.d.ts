import type { ExpressionNode } from './expression-node';
export declare class PropertyNode {
    readonly comment: string | null;
    readonly key: string;
    readonly type = "Property";
    readonly value: ExpressionNode;
    constructor(key: string, value: ExpressionNode, comment?: string | null);
}

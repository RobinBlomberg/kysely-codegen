import type { ExpressionNode } from './expression-node';
export declare class TemplateNode {
    readonly expression: ExpressionNode;
    readonly params: string[];
    readonly type = "Template";
    constructor(params: string[], expression: ExpressionNode);
}

import type { ExpressionNode } from './expression-node';
import { IdentifierNode } from './identifier-node';
import type { TemplateNode } from './template-node';
export declare class AliasDeclarationNode {
    readonly body: ExpressionNode | TemplateNode;
    readonly id: IdentifierNode;
    readonly type = "AliasDeclaration";
    constructor(name: string, body: ExpressionNode | TemplateNode);
}

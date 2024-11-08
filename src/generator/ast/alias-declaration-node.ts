import type { ExpressionNode } from './expression-node';
import { AliasIdentifierNode, type IdentifierNode } from './identifier-node';
import { NodeType } from './node-type';
import type { TemplateNode } from './template-node';

export class AliasDeclarationNode {
  readonly body: ExpressionNode | TemplateNode;
  readonly id: IdentifierNode;
  readonly type = NodeType.ALIAS_DECLARATION;

  constructor(name: string, body: ExpressionNode | TemplateNode) {
    this.id = new AliasIdentifierNode(name);
    this.body = body;
  }
}

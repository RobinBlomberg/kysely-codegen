import type { ExpressionNode } from './expression-node.js';
import { NodeType } from './node-type.js';
import type { TemplateNode } from './template-node.js';

export class AliasDeclarationNode {
  readonly body: ExpressionNode | TemplateNode;
  readonly name: string;
  readonly type = NodeType.ALIAS_DECLARATION;

  constructor(name: string, body: ExpressionNode | TemplateNode) {
    this.name = name;
    this.body = body;
  }
}

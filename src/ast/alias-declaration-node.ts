import { ExpressionNode } from './expression-node';
import { NodeType } from './node-type';
import { TemplateNode } from './template-node';

export class AliasDeclarationNode {
  readonly body: ExpressionNode | TemplateNode;
  readonly name: string;
  readonly type = NodeType.ALIAS_DECLARATION;

  constructor(name: string, body: ExpressionNode | TemplateNode) {
    this.name = name;
    this.body = body;
  }
}

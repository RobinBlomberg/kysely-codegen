import { ExpressionNode } from './expression-node';
import { NodeType } from './node-type';

export class TemplateNode {
  readonly expression: ExpressionNode;
  readonly params: string[];
  readonly type = NodeType.TEMPLATE;

  constructor(params: string[], expression: ExpressionNode) {
    this.params = params;
    this.expression = expression;
  }
}

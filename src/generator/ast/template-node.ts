import type { ExpressionNode } from './expression-node.js';
import { NodeType } from './node-type.js';

export class TemplateNode {
  readonly expression: ExpressionNode;
  readonly params: string[];
  readonly type = NodeType.TEMPLATE;

  constructor(params: string[], expression: ExpressionNode) {
    this.params = params;
    this.expression = expression;
  }
}

import type { ExpressionNode } from './expression-node.js';
import { NodeType } from './node-type.js';

export class ArrayExpressionNode {
  readonly type = NodeType.ARRAY_EXPRESSION;
  readonly values: ExpressionNode;

  constructor(values: ExpressionNode) {
    this.values = values;
  }
}

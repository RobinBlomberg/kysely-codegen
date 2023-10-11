import { ExpressionNode } from './expression-node';
import { NodeType } from './node-type';

export class ArrayExpressionNode {
  readonly type = NodeType.ARRAY_EXPRESSION;
  readonly values: ExpressionNode;

  constructor(values: ExpressionNode) {
    this.values = values;
  }
}

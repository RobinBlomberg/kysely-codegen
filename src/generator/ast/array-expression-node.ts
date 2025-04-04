import type { ExpressionNode } from './expression-node';

export class ArrayExpressionNode {
  readonly type = 'ArrayExpression';
  readonly values: ExpressionNode;

  constructor(values: ExpressionNode) {
    this.values = values;
  }
}

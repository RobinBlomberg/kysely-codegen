import type { ExpressionNode } from './expression-node';

export class UnionExpressionNode {
  readonly args: ExpressionNode[];
  readonly type = 'UnionExpression';

  constructor(args: ExpressionNode[]) {
    this.args = args;
  }
}

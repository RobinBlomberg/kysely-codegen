import { ExpressionNode } from './expression-node';
import { NodeType } from './node-type';

export class UnionExpressionNode {
  readonly args: ExpressionNode[];
  readonly type = NodeType.UNION_EXPRESSION;

  constructor(args: ExpressionNode[]) {
    this.args = args;
  }
}

import type { ExpressionNode } from './expression-node.js';
import { NodeType } from './node-type.js';

export class UnionExpressionNode {
  readonly args: ExpressionNode[];
  readonly type = NodeType.UNION_EXPRESSION;

  constructor(args: ExpressionNode[]) {
    this.args = args;
  }
}

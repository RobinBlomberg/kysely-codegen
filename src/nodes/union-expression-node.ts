import { NodeType } from '../enums/node-type';
import { ExpressionNode } from './expression-node';

export class UnionExpressionNode {
  readonly args: ExpressionNode[];
  readonly type = NodeType.UNION_EXPRESSION;

  constructor(args: ExpressionNode[]) {
    this.args = args;
  }
}

import { NodeType } from '../enums/node-type';
import { ExpressionNode } from './expression-node';

export class UnionExpressionNode {
  static from(args: ExpressionNode[]) {
    return args.length === 1 ? args[0]! : new UnionExpressionNode(args);
  }

  readonly args: ExpressionNode[];
  readonly type = NodeType.UNION_EXPRESSION;

  constructor(args: ExpressionNode[]) {
    this.args = args;
  }
}

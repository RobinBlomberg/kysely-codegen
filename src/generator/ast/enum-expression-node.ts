import type { ExpressionNode } from './expression-node';
import { NodeType } from './node-type';

export class EnumExpressionNode {
  readonly args: ExpressionNode[];
  readonly type = NodeType.ENUM_EXPRESSION;

  constructor(args: ExpressionNode[]) {
    this.args = args;
  }
}

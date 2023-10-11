import { ExpressionNode } from './expression-node';
import { NodeType } from './node-type';

export class GenericExpressionNode {
  readonly args: ExpressionNode[];
  readonly name: string;
  readonly type = NodeType.GENERIC_EXPRESSION;

  constructor(name: string, args: ExpressionNode[]) {
    this.name = name;
    this.args = args;
  }
}

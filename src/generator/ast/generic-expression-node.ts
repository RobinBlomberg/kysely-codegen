import type { ExpressionNode } from './expression-node';

export class GenericExpressionNode {
  readonly args: ExpressionNode[];
  readonly name: string;
  readonly type = 'GenericExpression';

  constructor(name: string, args: ExpressionNode[]) {
    this.name = name;
    this.args = args;
  }
}

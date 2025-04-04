export class RawExpressionNode {
  readonly expression: string;
  readonly type = 'RawExpression';

  constructor(expression: string) {
    this.expression = expression;
  }
}

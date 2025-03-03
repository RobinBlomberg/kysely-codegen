import type { ExpressionNode } from './expression-node';

export class ExtendsClauseNode {
  readonly checkType: ExpressionNode;
  readonly extendsType: ExpressionNode;
  readonly trueType: ExpressionNode;
  readonly falseType: ExpressionNode;
  readonly type = 'ExtendsClause';

  constructor(
    checkType: ExpressionNode,
    extendsType: ExpressionNode,
    trueType: ExpressionNode,
    falseType: ExpressionNode,
  ) {
    this.checkType = checkType;
    this.extendsType = extendsType;
    this.trueType = trueType;
    this.falseType = falseType;
  }
}

import { NodeType } from '../enums';
import { ExpressionNode } from './expression-node';

export class ExtendsClauseNode {
  readonly alternate: ExpressionNode;
  readonly consequent: ExpressionNode;
  readonly name: string;
  readonly test: ExpressionNode;
  readonly type = NodeType.EXTENDS_CLAUSE;

  constructor(
    name: string,
    test: ExpressionNode,
    consequent: ExpressionNode,
    alternate: ExpressionNode,
  ) {
    this.name = name;
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
  }
}

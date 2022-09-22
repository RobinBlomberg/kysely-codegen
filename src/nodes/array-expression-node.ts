import { NodeType } from '../enums';
import { ExpressionNode } from './expression-node';

export class ArrayExpressionNode {
  readonly type = NodeType.ARRAY_EXPRESSION;
  readonly values: ExpressionNode;

  constructor(values: ExpressionNode) {
    this.values = values;
  }
}

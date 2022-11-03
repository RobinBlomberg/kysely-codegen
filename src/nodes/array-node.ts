import { NodeType } from '../enums';
import { ExpressionNode } from './expression-node';

export class ArrayNode {
  readonly value: ExpressionNode;
  readonly type = NodeType.ARRAY;

  constructor(value: ExpressionNode) {
    this.value = value;
  }
}

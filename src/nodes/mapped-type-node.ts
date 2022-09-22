import { NodeType } from '../enums';
import { ExpressionNode } from './expression-node';

export class MappedTypeNode {
  readonly type = NodeType.MAPPED_TYPE;
  readonly value: ExpressionNode;

  constructor(value: ExpressionNode) {
    this.value = value;
  }
}

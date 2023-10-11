import { ExpressionNode } from './expression-node';
import { NodeType } from './node-type';

export class MappedTypeNode {
  readonly type = NodeType.MAPPED_TYPE;
  readonly value: ExpressionNode;

  constructor(value: ExpressionNode) {
    this.value = value;
  }
}

import type { ExpressionNode } from './expression-node.js';
import { NodeType } from './node-type.js';

export class MappedTypeNode {
  readonly type = NodeType.MAPPED_TYPE;
  readonly value: ExpressionNode;

  constructor(value: ExpressionNode) {
    this.value = value;
  }
}

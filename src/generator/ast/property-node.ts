import type { ExpressionNode } from './expression-node.js';
import { NodeType } from './node-type.js';

export class PropertyNode {
  readonly key: string;
  readonly type = NodeType.PROPERTY;
  readonly value: ExpressionNode;

  constructor(key: string, value: ExpressionNode) {
    this.key = key;
    this.value = value;
  }
}

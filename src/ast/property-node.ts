import { ExpressionNode } from './expression-node';
import { NodeType } from './node-type';

export class PropertyNode {
  readonly key: string;
  readonly type = NodeType.PROPERTY;
  readonly value: ExpressionNode;

  constructor(key: string, value: ExpressionNode) {
    this.key = key;
    this.value = value;
  }
}

import type { ExpressionNode } from './expression-node';
import { NodeType } from './node-type';

export class PropertyNode {
  readonly key: string;
  readonly type = NodeType.PROPERTY;
  readonly value: ExpressionNode;
  readonly comment?: string;

  constructor(key: string, value: ExpressionNode, comment?: string) {
    this.key = key;
    this.value = value;
    this.comment = comment;
  }
}

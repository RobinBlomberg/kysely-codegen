import type { ExpressionNode } from './expression-node';
import { NodeType } from './node-type';

export class PropertyNode {
  readonly comment: string | null;
  readonly key: string;
  readonly type = NodeType.PROPERTY;
  readonly value: ExpressionNode;

  constructor(
    key: string,
    value: ExpressionNode,
    comment: string | null = null,
  ) {
    this.comment = comment;
    this.key = key;
    this.value = value;
  }
}

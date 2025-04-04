import type { ExpressionNode } from './expression-node';

export class PropertyNode {
  readonly comment: string | null;
  readonly key: string;
  readonly type = 'Property';
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

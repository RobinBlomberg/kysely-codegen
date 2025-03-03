import type { ExpressionNode } from './expression-node';

export class MappedTypeNode {
  readonly type = 'MappedType';
  readonly value: ExpressionNode;

  constructor(value: ExpressionNode) {
    this.value = value;
  }
}

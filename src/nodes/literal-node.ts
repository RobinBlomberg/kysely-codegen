import { NodeType } from '../enums';

export class LiteralNode {
  readonly type = NodeType.LITERAL;
  readonly value: string;

  constructor(value: string) {
    this.value = value;
  }
}

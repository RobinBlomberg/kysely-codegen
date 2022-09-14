import { NodeType } from '../enums/node-type';

export class LiteralNode {
  static from(value: string) {
    return new LiteralNode(value);
  }

  readonly type = NodeType.LITERAL;
  readonly value: string;

  constructor(value: string) {
    this.value = value;
  }
}

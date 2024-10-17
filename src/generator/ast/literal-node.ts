import { NodeType } from './node-type';

type Literal = number | string;

export class LiteralNode<T extends Literal = Literal> {
  readonly type = NodeType.LITERAL;
  readonly value: T;

  constructor(value: T) {
    this.value = value;
  }
}

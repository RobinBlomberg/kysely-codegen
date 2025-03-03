type Literal = number | string;

export class LiteralNode<T extends Literal = Literal> {
  readonly type = 'Literal';
  readonly value: T;

  constructor(value: T) {
    this.value = value;
  }
}

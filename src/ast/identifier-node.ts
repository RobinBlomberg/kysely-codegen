import { NodeType } from './node-type';

export class IdentifierNode {
  readonly name: string;
  readonly type = NodeType.IDENTIFIER;

  constructor(name: string) {
    this.name = name;
  }
}

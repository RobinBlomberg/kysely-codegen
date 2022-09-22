import { NodeType } from '../enums';

export class IdentifierNode {
  readonly name: string;
  readonly type = NodeType.IDENTIFIER;

  constructor(name: string) {
    this.name = name;
  }
}

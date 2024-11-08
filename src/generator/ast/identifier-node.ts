import { NodeType } from './node-type';

export const enum IdentifierNodeKind {
  ALIAS = 'alias',
  DATABASE = 'database',
  ENUM = 'enum',
  PRIMITIVE = 'primitive',
  TABLE = 'table',
}

export class IdentifierNode {
  readonly kind: IdentifierNodeKind | undefined;
  name: string;
  readonly type = NodeType.IDENTIFIER;

  constructor(name: string, kind?: IdentifierNodeKind) {
    this.kind = kind;
    this.name = name;
  }
}

export class AliasIdentifierNode extends IdentifierNode {
  constructor(name: string) {
    super(name, IdentifierNodeKind.ALIAS);
  }
}

export class DatabaseIdentifierNode extends IdentifierNode {
  constructor(name: string) {
    super(name, IdentifierNodeKind.DATABASE);
  }
}

export class EnumIdentifierNode extends IdentifierNode {
  constructor(name: string) {
    super(name, IdentifierNodeKind.ENUM);
  }
}

export class PrimitiveIdentifierNode extends IdentifierNode {
  constructor(name: string) {
    super(name, IdentifierNodeKind.PRIMITIVE);
  }
}

export class TableIdentifierNode extends IdentifierNode {
  constructor(name: string) {
    super(name, IdentifierNodeKind.TABLE);
  }
}

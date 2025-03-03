export class IdentifierNode {
  readonly isTableIdentifier: boolean;
  name: string;
  readonly type = 'Identifier';

  constructor(name: string, options?: { isTableIdentifier?: boolean }) {
    this.isTableIdentifier = !!options?.isTableIdentifier;
    this.name = name;
  }
}

export class TableIdentifierNode extends IdentifierNode {
  constructor(name: string) {
    super(name, { isTableIdentifier: true });
  }
}

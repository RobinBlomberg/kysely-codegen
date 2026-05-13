import type { IdentifierNode } from './identifier-node';
import type { ObjectExpressionNode } from './object-expression-node';

export class InterfaceDeclarationNode {
  readonly body: ObjectExpressionNode;
  readonly comment: string | null;
  readonly id: IdentifierNode;
  readonly type = 'InterfaceDeclaration';

  constructor(
    name: IdentifierNode,
    body: ObjectExpressionNode,
    comment: string | null = null,
  ) {
    this.id = name;
    this.body = body;
    this.comment = comment;
  }
}

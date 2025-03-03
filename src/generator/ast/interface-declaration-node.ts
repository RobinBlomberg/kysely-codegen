import type { IdentifierNode } from './identifier-node';
import type { ObjectExpressionNode } from './object-expression-node';

export class InterfaceDeclarationNode {
  readonly body: ObjectExpressionNode;
  readonly id: IdentifierNode;
  readonly type = 'InterfaceDeclaration';

  constructor(name: IdentifierNode, body: ObjectExpressionNode) {
    this.id = name;
    this.body = body;
  }
}

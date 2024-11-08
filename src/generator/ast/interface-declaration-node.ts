import type { IdentifierNode } from './identifier-node';
import { NodeType } from './node-type';
import type { ObjectExpressionNode } from './object-expression-node';

export class InterfaceDeclarationNode {
  readonly body: ObjectExpressionNode;
  readonly id: IdentifierNode;
  readonly type = NodeType.INTERFACE_DECLARATION;

  constructor(name: IdentifierNode, body: ObjectExpressionNode) {
    this.id = name;
    this.body = body;
  }
}

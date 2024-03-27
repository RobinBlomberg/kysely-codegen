import type { ExpressionNode } from './expression-node.js';
import { NodeType } from './node-type.js';

export class RuntimeEnumDeclarationNode {
  readonly body: ExpressionNode;
  readonly name: string;
  readonly type = NodeType.RUNTIME_ENUM_DECLARATION;

  constructor(name: string, body: ExpressionNode) {
    this.name = name;
    this.body = body;
  }
}

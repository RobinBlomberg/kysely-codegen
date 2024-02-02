import type { AliasDeclarationNode } from './alias-declaration-node.js';
import type { InterfaceDeclarationNode } from './interface-declaration-node.js';
import { NodeType } from './node-type.js';

export class ExportStatementNode {
  readonly argument: AliasDeclarationNode | InterfaceDeclarationNode;
  readonly type = NodeType.EXPORT_STATEMENT;

  constructor(argument: AliasDeclarationNode | InterfaceDeclarationNode) {
    this.argument = argument;
  }
}

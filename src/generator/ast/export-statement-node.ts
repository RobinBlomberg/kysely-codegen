import type { AliasDeclarationNode } from './alias-declaration-node.js';
import type { InterfaceDeclarationNode } from './interface-declaration-node.js';
import { NodeType } from './node-type.js';
import type { RuntimeEnumDeclarationNode } from './runtime-enum-declaration-node.js';

export class ExportStatementNode {
  readonly argument:
    | AliasDeclarationNode
    | InterfaceDeclarationNode
    | RuntimeEnumDeclarationNode;
  readonly type = NodeType.EXPORT_STATEMENT;

  constructor(
    argument:
      | AliasDeclarationNode
      | InterfaceDeclarationNode
      | RuntimeEnumDeclarationNode,
  ) {
    this.argument = argument;
  }
}

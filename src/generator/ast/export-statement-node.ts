import type { AliasDeclarationNode } from './alias-declaration-node';
import type { InterfaceDeclarationNode } from './interface-declaration-node';
import { NodeType } from './node-type';
import type { RuntimeEnumDeclarationNode } from './runtime-enum-declaration-node';

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

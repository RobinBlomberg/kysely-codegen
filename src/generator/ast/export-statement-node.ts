import type { AliasDeclarationNode } from './alias-declaration-node';
import type { InterfaceDeclarationNode } from './interface-declaration-node';
import type { RuntimeEnumDeclarationNode } from './runtime-enum-declaration-node';

export class ExportStatementNode {
  readonly argument:
    | AliasDeclarationNode
    | InterfaceDeclarationNode
    | RuntimeEnumDeclarationNode;
  readonly type = 'ExportStatement';

  constructor(
    argument:
      | AliasDeclarationNode
      | InterfaceDeclarationNode
      | RuntimeEnumDeclarationNode,
  ) {
    this.argument = argument;
  }
}

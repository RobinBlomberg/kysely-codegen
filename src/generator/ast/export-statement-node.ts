import type { AliasDeclarationNode } from './alias-declaration-node';
import type { InterfaceDeclarationNode } from './interface-declaration-node';
import type { RuntimeEnumDeclarationNode } from './runtime-enum-declaration-node';

type ExportStatementArgumentNode =
  | AliasDeclarationNode
  | InterfaceDeclarationNode
  | RuntimeEnumDeclarationNode;

export class ExportStatementNode<
  T extends ExportStatementArgumentNode = ExportStatementArgumentNode,
> {
  readonly argument: T;
  readonly type = 'ExportStatement';

  constructor(argument: T) {
    this.argument = argument;
  }
}

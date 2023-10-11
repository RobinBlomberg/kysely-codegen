import { AliasDeclarationNode } from './alias-declaration-node';
import { InterfaceDeclarationNode } from './interface-declaration-node';
import { NodeType } from './node-type';

export class ExportStatementNode {
  readonly argument: AliasDeclarationNode | InterfaceDeclarationNode;
  readonly type = NodeType.EXPORT_STATEMENT;

  constructor(argument: AliasDeclarationNode | InterfaceDeclarationNode) {
    this.argument = argument;
  }
}

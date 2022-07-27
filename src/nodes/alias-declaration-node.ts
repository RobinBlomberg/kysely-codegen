import { NodeType } from '../enums/node-type';
import { ExpressionNode } from './expression-node';

export class AliasDeclarationNode {
  readonly args: string[];
  readonly body: ExpressionNode;
  readonly name: string;
  readonly type = NodeType.ALIAS_DECLARATION;

  constructor(name: string, generics: string[], body: ExpressionNode) {
    this.name = name;
    this.args = generics;
    this.body = body;
  }
}

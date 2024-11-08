import type { IdentifierStyle } from '../transformer/identifier-style';
import type { SymbolEntry } from '../transformer/symbol-collection';
import { SymbolCollection, SymbolType } from '../transformer/symbol-collection';
import { EnumIdentifierNode, type IdentifierNode } from './identifier-node';
import { LiteralNode } from './literal-node';
import { NodeType } from './node-type';

type RuntimeEnumMember = [key: string, value: LiteralNode<string>];

export class RuntimeEnumDeclarationNode {
  readonly members: RuntimeEnumMember[];
  id: IdentifierNode;
  readonly type = NodeType.RUNTIME_ENUM_DECLARATION;

  constructor(
    name: string,
    literals: string[],
    options?: { identifierStyle?: IdentifierStyle },
  ) {
    this.members = [];
    this.id = new EnumIdentifierNode(name);

    const symbolCollection = new SymbolCollection({
      entries: literals.map(
        (literal): SymbolEntry => [
          literal,
          {
            node: new LiteralNode(literal),
            type: SymbolType.RUNTIME_ENUM_MEMBER,
          },
        ],
      ),
      identifierStyle: options?.identifierStyle,
    });

    for (const { id, symbol } of symbolCollection.entries()) {
      if (symbol.type !== SymbolType.RUNTIME_ENUM_MEMBER) {
        continue;
      }

      this.members.push([id, symbol.node]);
    }
  }
}

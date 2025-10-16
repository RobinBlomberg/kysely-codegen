"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RuntimeEnumDeclarationNode = void 0;
const symbol_collection_1 = require("../transformer/symbol-collection");
const identifier_node_1 = require("./identifier-node");
const literal_node_1 = require("./literal-node");
class RuntimeEnumDeclarationNode {
    constructor(name, literals, options) {
        this.type = 'RuntimeEnumDeclaration';
        this.members = [];
        this.id = new identifier_node_1.IdentifierNode(name);
        const symbolCollection = new symbol_collection_1.SymbolCollection({
            entries: literals.map((literal) => [
                literal,
                { node: new literal_node_1.LiteralNode(literal), type: 'RuntimeEnumMember' },
            ]),
            identifierStyle: options?.identifierStyle,
        });
        for (const { id, symbol } of symbolCollection.entries()) {
            if (symbol.type !== 'RuntimeEnumMember') {
                continue;
            }
            this.members.push([id, symbol.node]);
        }
    }
}
exports.RuntimeEnumDeclarationNode = RuntimeEnumDeclarationNode;
//# sourceMappingURL=runtime-enum-declaration-node.js.map
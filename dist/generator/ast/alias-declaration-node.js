"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AliasDeclarationNode = void 0;
const identifier_node_1 = require("./identifier-node");
class AliasDeclarationNode {
    constructor(name, body) {
        this.type = 'AliasDeclaration';
        this.id = new identifier_node_1.IdentifierNode(name);
        this.body = body;
    }
}
exports.AliasDeclarationNode = AliasDeclarationNode;
//# sourceMappingURL=alias-declaration-node.js.map
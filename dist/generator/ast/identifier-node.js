"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableIdentifierNode = exports.IdentifierNode = void 0;
class IdentifierNode {
    constructor(name, options) {
        this.type = 'Identifier';
        this.isTableIdentifier = !!options?.isTableIdentifier;
        this.name = name;
    }
}
exports.IdentifierNode = IdentifierNode;
class TableIdentifierNode extends IdentifierNode {
    constructor(name) {
        super(name, { isTableIdentifier: true });
    }
}
exports.TableIdentifierNode = TableIdentifierNode;
//# sourceMappingURL=identifier-node.js.map
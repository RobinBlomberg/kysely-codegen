"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportClauseNode = void 0;
class ImportClauseNode {
    constructor(name, alias = null) {
        this.type = 'ImportClause';
        this.name = name;
        this.alias = alias;
    }
}
exports.ImportClauseNode = ImportClauseNode;
//# sourceMappingURL=import-clause-node.js.map
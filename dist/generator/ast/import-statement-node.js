"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportStatementNode = void 0;
class ImportStatementNode {
    constructor(moduleName, imports) {
        this.type = 'ImportStatement';
        this.moduleName = moduleName;
        this.imports = imports;
    }
}
exports.ImportStatementNode = ImportStatementNode;
//# sourceMappingURL=import-statement-node.js.map
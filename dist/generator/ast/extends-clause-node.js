"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendsClauseNode = void 0;
class ExtendsClauseNode {
    constructor(checkType, extendsType, trueType, falseType) {
        this.type = 'ExtendsClause';
        this.checkType = checkType;
        this.extendsType = extendsType;
        this.trueType = trueType;
        this.falseType = falseType;
    }
}
exports.ExtendsClauseNode = ExtendsClauseNode;
//# sourceMappingURL=extends-clause-node.js.map
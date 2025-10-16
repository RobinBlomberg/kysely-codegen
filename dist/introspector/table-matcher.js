"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableMatcher = void 0;
const micromatch_1 = require("micromatch");
class TableMatcher {
    constructor(pattern) {
        this.isMatch = (0, micromatch_1.matcher)(pattern, { nocase: true });
        this.isSimpleGlob = !pattern.includes('.');
    }
    match(schema, name) {
        const string = this.isSimpleGlob ? name : `${schema ?? '*'}.${name}`;
        return this.isMatch(string);
    }
}
exports.TableMatcher = TableMatcher;
//# sourceMappingURL=table-matcher.js.map
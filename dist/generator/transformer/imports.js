"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GLOBAL_IMPORTS = void 0;
const module_reference_node_1 = require("../ast/module-reference-node");
exports.GLOBAL_IMPORTS = {
    ColumnType: new module_reference_node_1.ModuleReferenceNode('kysely'),
    JSONColumnType: new module_reference_node_1.ModuleReferenceNode('kysely'),
};
//# sourceMappingURL=imports.js.map
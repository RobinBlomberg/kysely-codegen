"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Adapter = void 0;
const identifier_node_1 = require("./ast/identifier-node");
/**
 * Specifies settings for how code should be generated for the given database library.
 */
class Adapter {
    constructor() {
        this.defaultScalar = new identifier_node_1.IdentifierNode('unknown');
        this.defaultSchemas = [];
        this.definitions = {};
        this.imports = {};
        this.scalars = {};
    }
}
exports.Adapter = Adapter;
//# sourceMappingURL=adapter.js.map
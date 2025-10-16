"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyNode = void 0;
class PropertyNode {
    constructor(key, value, comment = null) {
        this.type = 'Property';
        this.comment = comment;
        this.key = key;
        this.value = value;
    }
}
exports.PropertyNode = PropertyNode;
//# sourceMappingURL=property-node.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumCollection = void 0;
class EnumCollection {
    constructor(enums = {}) {
        this.enums = {};
        this.enums = Object.fromEntries(Object.entries(enums).map(([key, value]) => {
            return [key.toLowerCase(), value];
        }));
    }
    add(key, value) {
        var _a, _b;
        ((_a = this.enums)[_b = key.toLowerCase()] ?? (_a[_b] = [])).push(value);
    }
    get(key) {
        return (this.enums[key.toLowerCase()]?.sort((a, b) => a.localeCompare(b)) ?? null);
    }
    has(key) {
        return !!this.enums[key.toLowerCase()];
    }
    set(key, values) {
        this.enums[key.toLowerCase()] = values;
    }
}
exports.EnumCollection = EnumCollection;
//# sourceMappingURL=enum-collection.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPascalCase = exports.toCamelCase = void 0;
const kysely_1 = require("kysely");
class CaseConverter extends kysely_1.CamelCasePlugin {
    toCamelCase(string) {
        return this.camelCase(string);
    }
    toSnakeCase(string) {
        return this.snakeCase(string);
    }
}
/**
 * Returns a camelCased string.
 *
 * @example
 * ```ts
 * camelCase('foo_bar')
 * // fooBar
 * ```
 */
const toCamelCase = (string) => {
    // Match the runtime CustomCamelCasePlugin in consumer projects: `Id`/`Ids`
    // at the end of an identifier (or before an uppercase/digit) become
    // `ID`/`IDs`. Apply `Ids` first so the singular rule doesn't pre-eat its
    // trailing `Id`. The `g` flag handles identifiers with multiple `Id`s.
    return new CaseConverter()
        .toCamelCase(string)
        .replace(/Ids(?![a-z])/g, 'IDs')
        .replace(/Id(?![a-z])/g, 'ID');
};
exports.toCamelCase = toCamelCase;
/**
 * Returns a PascalCased string.
 *
 * @example
 * ```ts
 * pascalCase('foo_bar')
 * // FooBar
 * ```
 */
const toPascalCase = (string) => {
    const camelCased = (0, exports.toCamelCase)(string);
    return camelCased.slice(0, 1).toUpperCase() + camelCased.slice(1);
};
exports.toPascalCase = toPascalCase;
//# sourceMappingURL=case-converter.js.map
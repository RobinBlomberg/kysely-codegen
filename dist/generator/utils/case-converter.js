"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toWords = exports.toScreamingSnakeCase = exports.toPascalCase = exports.toKyselyPascalCase = exports.toKyselyCamelCase = void 0;
const kysely_1 = require("kysely");
class CaseConverter extends kysely_1.CamelCasePlugin {
    toCamelCase(string) {
        return this.camelCase(string);
    }
}
/**
 * @example
 * toUpperFirst('fooBar')
 * // => 'FooBar'
 */
const toUpperFirst = (string) => {
    return `${string.slice(0, 1).toUpperCase()}${string.slice(1)}`;
};
/**
 * @example
 * toKyselyCamelCase('foo_bar')
 * // => 'fooBar'
 */
const toKyselyCamelCase = (string) => {
    return new CaseConverter().toCamelCase(string);
};
exports.toKyselyCamelCase = toKyselyCamelCase;
/**
 * @example
 * toKyselyPascalCase('foo_bar')
 * // => 'FooBar'
 */
const toKyselyPascalCase = (string) => {
    return toUpperFirst((0, exports.toKyselyCamelCase)(string));
};
exports.toKyselyPascalCase = toKyselyPascalCase;
/**
 * @example
 * toPascalCase('foo_bar')
 * // => 'FooBar'
 */
const toPascalCase = (string) => {
    return (0, exports.toWords)(string)
        .map((w) => toUpperFirst(w.toLowerCase()))
        .join('');
};
exports.toPascalCase = toPascalCase;
/**
 * @example
 * pascalCase('foo_bar')
 * // => 'FOO_BAR'
 */
const toScreamingSnakeCase = (string) => {
    return (0, exports.toWords)(string)
        .map((w, i) => `${i ? '_' : ''}${w.toUpperCase()}`)
        .join('');
};
exports.toScreamingSnakeCase = toScreamingSnakeCase;
/**
 * @example
 * toWords('FooBar')
 * // => ['Foo', 'Bar']
 */
const toWords = (string) => {
    return (string.match(/(?:\p{Lu}(?!\p{Ll}))+|\p{L}\p{Ll}*|\d+/gu)?.slice() ?? []);
};
exports.toWords = toWords;
//# sourceMappingURL=case-converter.js.map
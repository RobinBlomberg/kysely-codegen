import { CamelCasePlugin } from 'kysely';

class CaseConverter extends CamelCasePlugin {
  toCamelCase(string: string) {
    return this.camelCase(string);
  }
}

/**
 * @example
 * toUpperFirst('fooBar')
 * // => 'FooBar'
 */
const toUpperFirst = (string: string): string => {
  return `${string.slice(0, 1).toUpperCase()}${string.slice(1)}`;
};

/**
 * @example
 * toWords('FooBar')
 * // => ['Foo', 'Bar']
 */
const toWords = (string: string) => {
  return string.match(/(?:\p{Lu}(?!\p{Ll}))+|\p{L}\p{Ll}*/gu)?.slice() ?? [];
};

/**
 * @example
 * toCamelCase('foo_bar')
 * // => 'fooBar'
 */
export const toCamelCase = (string: string) => {
  return toWords(string)
    .map((w, i) => (i ? toUpperFirst(w.toLowerCase()) : w.toLowerCase()))
    .join('');
};

/**
 * @example
 * toKyselyCamelCase('foo_bar')
 * // => 'fooBar'
 */
export const toKyselyCamelCase = (string: string) => {
  return new CaseConverter().toCamelCase(string);
};

/**
 * @example
 * toKyselyPascalCase('foo_bar')
 * // => 'FooBar'
 */
export const toKyselyPascalCase = (string: string) => {
  return toUpperFirst(toKyselyCamelCase(string));
};

/**
 * @example
 * toPascalCase('foo_bar')
 * // => 'FooBar'
 */
export const toPascalCase = (string: string) => {
  return toWords(string)
    .map((w) => toUpperFirst(w.toLowerCase()))
    .join('');
};

/**
 * @example
 * pascalCase('foo_bar')
 * // => 'FOO_BAR'
 */
export const toScreamingSnakeCase = (string: string) => {
  return toWords(string)
    .map((w, i) => `${i ? '_' : ''}${w.toUpperCase()}`)
    .join('');
};

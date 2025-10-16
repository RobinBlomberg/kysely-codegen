/**
 * @example
 * toKyselyCamelCase('foo_bar')
 * // => 'fooBar'
 */
export declare const toKyselyCamelCase: (string: string) => string;
/**
 * @example
 * toKyselyPascalCase('foo_bar')
 * // => 'FooBar'
 */
export declare const toKyselyPascalCase: (string: string) => string;
/**
 * @example
 * toPascalCase('foo_bar')
 * // => 'FooBar'
 */
export declare const toPascalCase: (string: string) => string;
/**
 * @example
 * pascalCase('foo_bar')
 * // => 'FOO_BAR'
 */
export declare const toScreamingSnakeCase: (string: string) => string;
/**
 * @example
 * toWords('FooBar')
 * // => ['Foo', 'Bar']
 */
export declare const toWords: (string: string) => string[];

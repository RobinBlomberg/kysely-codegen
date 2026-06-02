import { CamelCasePlugin } from 'kysely';

class CaseConverter extends CamelCasePlugin {
  toCamelCase(string: string) {
    return this.camelCase(string);
  }

  toSnakeCase(string: string) {
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
export const toCamelCase = (string: string) => {
  // Match the runtime CustomCamelCasePlugin in consumer projects: `Id`/`Ids`
  // at the end of an identifier (or before an uppercase/digit) become
  // `ID`/`IDs`. Apply `Ids` first so the singular rule doesn't pre-eat its
  // trailing `Id`. The `g` flag handles identifiers with multiple `Id`s.
  return new CaseConverter()
    .toCamelCase(string)
    .replace(/Ids(?![a-z])/g, 'IDs')
    .replace(/Id(?![a-z])/g, 'ID');
};

/**
 * Returns a PascalCased string.
 *
 * @example
 * ```ts
 * pascalCase('foo_bar')
 * // FooBar
 * ```
 */
export const toPascalCase = (string: string) => {
  const camelCased = toCamelCase(string);
  return camelCased.slice(0, 1).toUpperCase() + camelCased.slice(1);
};

/**
 * Returns a PascalCased string.
 *
 * @example
 * ```ts
 * pascalCase('foo_bar')
 * // FooBar
 * ```
 */
export function pascalCase(str: string): string {
  return str
    .split('_')
    .map((word) => {
      return word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
}

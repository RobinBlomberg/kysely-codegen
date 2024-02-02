export class EnumMap {
  readonly #enums: Record<string, string[]> = {};

  constructor(enums: Record<string, string[]> = {}) {
    this.#enums = enums;
  }

  add(key: string, value: string) {
    (this.#enums[key] ??= []).push(value);
  }

  get(key: string) {
    return this.#enums[key]?.sort((a, b) => a.localeCompare(b)) ?? [];
  }

  has(key: string) {
    return !!this.#enums[key];
  }

  set(key: string, values: string[]) {
    this.#enums[key] = values;
  }

  toPlainObject() {
    return this.#enums;
  }
}

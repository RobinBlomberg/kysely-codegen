export type EnumMap = {
  [K in string]?: string[];
};

export class EnumCollection {
  readonly enums: EnumMap = {};

  constructor(enums: EnumMap = {}) {
    this.enums = enums;
  }

  add(key: string, value: string) {
    (this.enums[key] ??= []).push(value);
  }

  get(key: string) {
    return this.enums[key]?.sort((a, b) => a.localeCompare(b)) ?? null;
  }

  has(key: string) {
    return !!this.enums[key];
  }

  set(key: string, values: string[]) {
    this.enums[key] = values;
  }
}

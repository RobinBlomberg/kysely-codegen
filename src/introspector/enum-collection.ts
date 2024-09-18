type EnumMap = Record<string, string[] | undefined>;

export class EnumCollection {
  readonly enums: EnumMap = {};

  constructor(enums: EnumMap = {}) {
    this.enums = Object.fromEntries(
      Object.entries(enums).map(([key, value]) => {
        return [key.toLowerCase(), value];
      }),
    );
  }

  add(key: string, value: string) {
    (this.enums[key.toLowerCase()] ??= []).push(value);
  }

  get(key: string) {
    return (
      this.enums[key.toLowerCase()]?.sort((a, b) => a.localeCompare(b)) ?? null
    );
  }

  has(key: string) {
    return !!this.enums[key.toLowerCase()];
  }

  set(key: string, values: string[]) {
    this.enums[key.toLowerCase()] = values;
  }
}

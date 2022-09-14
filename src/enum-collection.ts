import { AdapterDefinitions, AdapterTypes } from './adapter';
import { toPascalCase } from './case-converter';
import { IdentifierNode, UnionExpressionNode } from './nodes';
import { LiteralNode } from './nodes/literal-node';

export type EnumMap = {
  [K in string]?: string[];
};

export class EnumCollection {
  readonly enums: EnumMap = {};

  add(key: string, value: string) {
    (this.enums[key] ??= []).push(value);
  }

  get(key: string) {
    return this.enums[key] ?? null;
  }

  getDefinitions() {
    const definitions: AdapterDefinitions = {};

    for (const [key, values] of Object.entries(this.enums)) {
      const name = toPascalCase(key);
      definitions[name] = UnionExpressionNode.from(
        values!.map((value) => new LiteralNode(value)),
      );
    }

    return definitions;
  }

  getTypes() {
    const types: AdapterTypes = {};

    for (const key of Object.keys(this.enums)) {
      types[key] = new IdentifierNode(toPascalCase(key));
    }

    return types;
  }

  set(key: string, values: string[]) {
    this.enums[key] = values;
  }
}

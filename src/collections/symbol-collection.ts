import { toPascalCase } from '../case-converter';
import { ExpressionNode, ModuleReferenceNode, TemplateNode } from '../nodes';

export type SymbolMap = {
  [K in string]?: SymbolNode;
};

export type SymbolNameMap = {
  [K in string]?: string;
};

export type SymbolNode =
  | { node: ExpressionNode | TemplateNode; type: SymbolType.DEFINITION }
  | { node: ModuleReferenceNode; type: SymbolType.MODULE_REFERENCE }
  | { type: SymbolType.TABLE };

export const enum SymbolType {
  DEFINITION = 'Definition',
  MODULE_REFERENCE = 'ModuleReference',
  TABLE = 'Table',
}

export class SymbolCollection {
  readonly symbolNames: SymbolNameMap;
  readonly symbols: SymbolMap;

  constructor(symbols: SymbolMap = {}, symbolNames: SymbolNameMap = {}) {
    this.symbolNames = symbolNames;
    this.symbols = symbols;
  }

  entries() {
    return Object.entries(this.symbols).map(([id, symbol]) => ({
      id,
      name: this.symbolNames[id]!,
      symbol: symbol!,
    }));
  }

  get(id: string) {
    return this.symbols[id];
  }

  getName(id: string) {
    return this.symbolNames[id];
  }

  has(id: string) {
    return this.symbols[id] !== undefined;
  }

  set(id: string, symbol: SymbolNode) {
    let symbolName = this.symbolNames[id];

    if (symbolName) {
      return symbolName;
    }

    const symbolNames = new Set(Object.values(this.symbolNames));
    symbolName = toPascalCase(id.replace(/\./g, '_'));

    if (symbolNames.has(symbolName)) {
      let suffix = 2;

      while (symbolNames.has(`${symbolName}${suffix}`)) {
        suffix++;
      }

      symbolName += suffix;
    }

    this.symbols[id] = symbol;
    this.symbolNames[id] = symbolName;

    return symbolName;
  }
}

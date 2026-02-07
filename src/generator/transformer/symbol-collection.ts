import type { ExpressionNode } from '../ast/expression-node';
import type { LiteralNode } from '../ast/literal-node';
import type { ModuleReferenceNode } from '../ast/module-reference-node';
import type { RuntimeEnumDeclarationNode } from '../ast/runtime-enum-declaration-node';
import type { TemplateNode } from '../ast/template-node';
import {
  toKyselyPascalCase,
  toScreamingSnakeCase,
} from '../utils/case-converter';
import type { IdentifierStyle } from './identifier-style';

export type SymbolEntry = [id: string, symbol: SymbolNode];

type SymbolMap = Record<string, SymbolNode | undefined>;

type SymbolNameMap = Record<string, string | undefined>;

export type SymbolNode =
  | { node: ExpressionNode | TemplateNode; type: 'Definition' }
  | { node: ModuleReferenceNode; type: 'ModuleReference' }
  | { node: RuntimeEnumDeclarationNode; type: 'RuntimeEnumDefinition' }
  | { node: LiteralNode<string>; type: 'RuntimeEnumMember' }
  | { type: 'Table' };

export type SymbolType =
  | 'Definition'
  | 'ModuleReference'
  | 'RuntimeEnumDefinition'
  | 'RuntimeEnumMember'
  | 'Table';

export class SymbolCollection {
  readonly identifierStyle: IdentifierStyle;
  readonly symbolNames: SymbolNameMap = {};
  readonly symbols: SymbolMap = {};

  constructor(options?: {
    entries?: SymbolEntry[];
    identifierStyle?: IdentifierStyle;
  }) {
    this.identifierStyle = options?.identifierStyle ?? 'kysely-pascal-case';

    const entries =
      options?.entries?.sort(([a], [b]) => a.localeCompare(b)) ?? [];

    for (const [id, symbol] of entries) {
      this.set(id, symbol);
    }
  }

  entries() {
    return Object.entries(this.symbols)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, symbol]) => ({
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
    const caseConverter =
      this.identifierStyle === 'screaming-snake-case'
        ? toScreamingSnakeCase
        : toKyselyPascalCase;

    // Replace characters with underscores except for:
    // - Word characters (A-Z, a-z, 0-9, _)
    // - Dollar sign ($)
    // - CJK Unified Ideographs Extension A (U+3400–U+4DBF)
    // - CJK Unified Ideographs (U+4E00–U+9FFF)
    // - CJK Compatibility Ideographs (U+F900–U+FAFF)
    symbolName = caseConverter(
      id.replaceAll(/[^\w$\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/g, '_'),
    );

    if (symbolNames.has(symbolName)) {
      let suffix = 2;

      while (symbolNames.has(`${symbolName}${suffix}`)) {
        suffix++;
      }

      symbolName += suffix;
    }

    if (/^\d/.test(symbolName)) {
      symbolName = `_${symbolName}`;
    }

    this.symbols[id] = symbol;
    this.symbolNames[id] = symbolName;

    return symbolName;
  }
}

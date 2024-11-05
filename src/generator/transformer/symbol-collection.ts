import type { ExpressionNode } from '../ast/expression-node';
import type { LiteralNode } from '../ast/literal-node';
import type { ModuleReferenceNode } from '../ast/module-reference-node';
import type { RuntimeEnumDeclarationNode } from '../ast/runtime-enum-declaration-node';
import type { TemplateNode } from '../ast/template-node';
import {
  toKyselyCamelCase,
  toKyselyPascalCase,
  toScreamingSnakeCase,
} from '../utils/case-converter';
import { IdentifierStyle } from './identifier-style';

export type SymbolEntry = [id: string, symbol: SymbolNode];

type SymbolMap = Record<string, SymbolNode | undefined>;

type SymbolNameMap = Record<string, string | undefined>;

export type SymbolNode =
  | { node: ExpressionNode | TemplateNode; type: SymbolType.DEFINITION }
  | { node: ModuleReferenceNode; type: SymbolType.MODULE_REFERENCE }
  | {
      node: RuntimeEnumDeclarationNode;
      type: SymbolType.RUNTIME_ENUM_DEFINITION;
    }
  | { node: LiteralNode<string>; type: SymbolType.RUNTIME_ENUM_MEMBER }
  | { type: SymbolType.TABLE };

export const enum SymbolType {
  DEFINITION = 'Definition',
  MODULE_REFERENCE = 'ModuleReference',
  RUNTIME_ENUM_DEFINITION = 'RuntimeEnumDefinition',
  RUNTIME_ENUM_MEMBER = 'RuntimeEnumMember',
  TABLE = 'Table',
}

export class SymbolCollection {
  readonly isGenerateZod: boolean = false;
  readonly identifierStyle: IdentifierStyle;
  readonly symbolNames: SymbolNameMap = {};
  readonly symbols: SymbolMap = {};

  constructor(options?: {
    entries?: SymbolEntry[];
    identifierStyle?: IdentifierStyle;
    generateZod?: boolean;
  }) {
    this.identifierStyle =
      options?.identifierStyle ?? IdentifierStyle.KYSELY_PASCAL_CASE;

    const entries =
      options?.entries?.sort(([a], [b]) => a.localeCompare(b)) ?? [];

    for (const [id, symbol] of entries) {
      this.set(id, symbol);
    }

    this.isGenerateZod = options?.generateZod ?? false;
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
    let caseConverter;
    if (this.isGenerateZod) {
      caseConverter = toKyselyCamelCase;
    } else {
      caseConverter =
        this.identifierStyle === IdentifierStyle.SCREAMING_SNAKE_CASE
          ? toScreamingSnakeCase
          : toKyselyPascalCase;
    }

    symbolName = caseConverter(id.replaceAll(/[^\w$]/g, '_'));

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

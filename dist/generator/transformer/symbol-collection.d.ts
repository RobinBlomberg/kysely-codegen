import type { ExpressionNode } from '../ast/expression-node';
import type { LiteralNode } from '../ast/literal-node';
import type { ModuleReferenceNode } from '../ast/module-reference-node';
import type { RuntimeEnumDeclarationNode } from '../ast/runtime-enum-declaration-node';
import type { TemplateNode } from '../ast/template-node';
import type { IdentifierStyle } from './identifier-style';
export type SymbolEntry = [id: string, symbol: SymbolNode];
type SymbolMap = Record<string, SymbolNode | undefined>;
type SymbolNameMap = Record<string, string | undefined>;
export type SymbolNode = {
    node: ExpressionNode | TemplateNode;
    type: 'Definition';
} | {
    node: ModuleReferenceNode;
    type: 'ModuleReference';
} | {
    node: RuntimeEnumDeclarationNode;
    type: 'RuntimeEnumDefinition';
} | {
    node: LiteralNode<string>;
    type: 'RuntimeEnumMember';
} | {
    type: 'Table';
};
export type SymbolType = 'Definition' | 'ModuleReference' | 'RuntimeEnumDefinition' | 'RuntimeEnumMember' | 'Table';
export declare class SymbolCollection {
    readonly identifierStyle: IdentifierStyle;
    readonly symbolNames: SymbolNameMap;
    readonly symbols: SymbolMap;
    constructor(options?: {
        entries?: SymbolEntry[];
        identifierStyle?: IdentifierStyle;
    });
    entries(): {
        id: string;
        name: string;
        symbol: SymbolNode;
    }[];
    get(id: string): SymbolNode | undefined;
    getName(id: string): string | undefined;
    has(id: string): boolean;
    set(id: string, symbol: SymbolNode): string;
}
export {};

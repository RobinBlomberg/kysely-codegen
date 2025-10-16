import type { IdentifierStyle } from '../transformer/identifier-style';
import { IdentifierNode } from './identifier-node';
import { LiteralNode } from './literal-node';
type RuntimeEnumMember = [key: string, value: LiteralNode<string>];
export declare class RuntimeEnumDeclarationNode {
    readonly members: RuntimeEnumMember[];
    id: IdentifierNode;
    readonly type = "RuntimeEnumDeclaration";
    constructor(name: string, literals: string[], options?: {
        identifierStyle?: IdentifierStyle;
    });
}
export {};

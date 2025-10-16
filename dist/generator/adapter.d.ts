import type { DefinitionNode } from './ast/definition-node';
import type { ExpressionNode } from './ast/expression-node';
import type { ModuleReferenceNode } from './ast/module-reference-node';
export type Definitions = Record<string, DefinitionNode | undefined>;
export type Imports = Record<string, ModuleReferenceNode | undefined>;
export type Scalars = Record<string, ExpressionNode | undefined>;
/**
 * Specifies settings for how code should be generated for the given database library.
 */
export declare abstract class Adapter {
    readonly defaultScalar: ExpressionNode;
    readonly defaultSchemas: string[];
    readonly definitions: Definitions;
    readonly imports: Imports;
    readonly scalars: Scalars;
}

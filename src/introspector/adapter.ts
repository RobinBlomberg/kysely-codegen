import type { DefinitionNode } from '../generator/ast/definition-node';
import type { ExpressionNode } from '../generator/ast/expression-node';
import { IdentifierNode } from '../generator/ast/identifier-node';
import type { ModuleReferenceNode } from '../generator/ast/module-reference-node';

export type Definitions = Record<string, DefinitionNode | undefined>;

export type Imports = Record<string, ModuleReferenceNode | undefined>;

export type Scalars = Record<string, ExpressionNode | undefined>;

/**
 * Specifies settings for how code should be generated for the given database library.
 */
export abstract class Adapter {
  readonly defaultScalar: ExpressionNode = new IdentifierNode('unknown');
  readonly defaultSchema: string | null = null;
  readonly definitions: Definitions = {};
  readonly imports: Imports = {};
  readonly scalars: Scalars = {};
}

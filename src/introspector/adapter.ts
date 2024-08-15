import {
  IdentifierNode,
  type DefinitionNode,
  type ExpressionNode,
  type ModuleReferenceNode,
} from '../generator';

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

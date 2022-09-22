import {
  DefinitionNode,
  ExpressionNode,
  IdentifierNode,
  ModuleReferenceNode,
} from './nodes';

export type Definitions = { [K in string]?: DefinitionNode };

export type Imports = { [K in string]?: ModuleReferenceNode };

export type Scalars = { [K in string]?: ExpressionNode };

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

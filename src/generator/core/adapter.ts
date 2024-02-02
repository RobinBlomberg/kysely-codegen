import type { DefinitionNode } from '../ast/definition-node.js';
import type { ExpressionNode } from '../ast/expression-node.js';
import { IdentifierNode } from '../ast/identifier-node.js';
import type { ModuleReferenceNode } from '../ast/module-reference-node.js';

/**
 * Specifies settings for how code should be generated for the given database library.
 */
export type Adapter = {
  defaultScalar: ExpressionNode;
  defaultSchema: string | null;
  definitions: DefinitionMap;
  imports: ImportMap;
  scalars: ScalarMap;
};

export type AdapterInput = {
  defaultScalar?: ExpressionNode;
  defaultSchema?: string | null;
  definitions?: DefinitionMap;
  imports?: ImportMap;
  scalars?: ScalarMap;
};

export type DefinitionMap = { [K in string]?: DefinitionNode };

export type ImportMap = { [K in string]?: ModuleReferenceNode };

export type ScalarMap = { [K in string]?: ExpressionNode };

export const createAdapter = (input: AdapterInput): Adapter => {
  return {
    defaultScalar: input.defaultScalar ?? new IdentifierNode('unknown'),
    defaultSchema: input.defaultSchema ?? null,
    definitions: input.definitions ?? {},
    imports: input.imports ?? {},
    scalars: input.scalars ?? {},
  };
};

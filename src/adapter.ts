import { Definition } from './constants/definitions';
import { ExpressionNode } from './nodes/expression-node';
import { IdentifierNode } from './nodes/identifier-node';

export type AdapterDefinitions = { [K in string]?: Definition };

export type AdapterImports = { [K in string]?: string };

export type AdapterTypes = { [K in string]?: ExpressionNode };

/**
 * Specifies how code should be generated for a given database library.
 */
export abstract class Adapter {
  readonly defaultType: ExpressionNode = new IdentifierNode('unknown');
  readonly definitions: AdapterDefinitions = {};
  readonly imports: AdapterImports = {};
  readonly types: AdapterTypes = {};
}

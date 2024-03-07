import { IdentifierNode } from '../../ast/identifier-node.js';
import { createGeneratorAdapter } from '../adapter.js';

export const sqliteAdapter = createGeneratorAdapter({
  defaultScalar: new IdentifierNode('string'),
  scalars: {
    any: new IdentifierNode('unknown'),
    blob: new IdentifierNode('Buffer'),
    boolean: new IdentifierNode('number'),
    integer: new IdentifierNode('number'),
    numeric: new IdentifierNode('number'),
    real: new IdentifierNode('number'),
    text: new IdentifierNode('string'),
  },
});

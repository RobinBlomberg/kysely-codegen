import { IdentifierNode } from '../../ast/identifier-node.js';
import { createAdapter } from '../adapter.js';

export const sqliteAdapter = createAdapter({
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

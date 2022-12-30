import { Adapter } from '../../adapter';
import { IdentifierNode } from '../../nodes';

export class SqliteAdapter extends Adapter {
  override readonly defaultScalar = new IdentifierNode('string');
  override readonly scalars = {
    ANY: new IdentifierNode('unknown'),
    BLOB: new IdentifierNode('Buffer'),
    BOOLEAN: new IdentifierNode('number'),
    INTEGER: new IdentifierNode('number'),
    NUMERIC: new IdentifierNode('number'),
    REAL: new IdentifierNode('number'),
    TEXT: new IdentifierNode('string'),
  };
}

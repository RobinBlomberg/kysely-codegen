import { Adapter } from '../../adapter';
import { IdentifierNode } from '../../nodes/identifier-node';

export class SqliteAdapter extends Adapter {
  override readonly defaultType = new IdentifierNode('string');
  override readonly types = {
    ANY: new IdentifierNode('unknown'),
    BLOB: new IdentifierNode('Buffer'),
    INTEGER: new IdentifierNode('number'),
    NUMERIC: new IdentifierNode('number'),
    REAL: new IdentifierNode('number'),
    TEXT: new IdentifierNode('string'),
  };
}

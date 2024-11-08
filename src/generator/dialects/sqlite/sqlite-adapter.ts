import { Adapter } from '../../adapter';
import {
  AliasIdentifierNode,
  PrimitiveIdentifierNode,
} from '../../ast/identifier-node';

export class SqliteAdapter extends Adapter {
  override readonly defaultScalar = new PrimitiveIdentifierNode('string');
  override readonly scalars = {
    any: new PrimitiveIdentifierNode('unknown'),
    blob: new AliasIdentifierNode('Buffer'),
    boolean: new PrimitiveIdentifierNode('number'),
    integer: new PrimitiveIdentifierNode('number'),
    numeric: new PrimitiveIdentifierNode('number'),
    real: new PrimitiveIdentifierNode('number'),
    text: new PrimitiveIdentifierNode('string'),
  };
}

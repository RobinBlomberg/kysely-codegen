import { Adapter } from '../../adapter';
import { IdentifierNode } from '../../ast/identifier-node';

const NUMERIC_TYPES = new Set([
  'bigint',
  'decimal',
  'double',
  'double precision',
  'float',
  'int',
  'int2',
  'int8',
  'integer',
  'mediumint',
  'numeric',
  'real',
  'smallint',
  'tinyint',
  'unsigned big int',
]);

export class SqliteAdapter extends Adapter {
  override readonly defaultScalar = new IdentifierNode('string');
  override readonly scalars = {
    any: new IdentifierNode('unknown'),
    blob: new IdentifierNode('Buffer'),
    boolean: new IdentifierNode('number'),
    integer: new IdentifierNode('number'),
    numeric: new IdentifierNode('number'),
    real: new IdentifierNode('number'),
    text: new IdentifierNode('string'),
  };

  override resolveScalar(dataType: string) {
    const scalar = super.resolveScalar(dataType);

    if (scalar) {
      return scalar;
    }

    const baseType = dataType
      .trim()
      .replace(/\s*\([^)]*\)$/, '')
      .replaceAll(/\s+/g, ' ');
    return NUMERIC_TYPES.has(baseType)
      ? new IdentifierNode('number')
      : undefined;
  }
}

import { Adapter } from '../../adapter';
import {
  AliasIdentifierNode,
  PrimitiveIdentifierNode,
} from '../../ast/identifier-node';

export class MssqlAdapter extends Adapter {
  // https://github.com/tediousjs/tedious/tree/master/src/data-types
  override readonly scalars = {
    bigint: new PrimitiveIdentifierNode('number'),
    binary: new AliasIdentifierNode('Buffer'),
    bit: new PrimitiveIdentifierNode('boolean'),
    char: new PrimitiveIdentifierNode('string'),
    date: new AliasIdentifierNode('Date'),
    datetime: new AliasIdentifierNode('Date'),
    datetime2: new AliasIdentifierNode('Date'),
    datetimeoffset: new AliasIdentifierNode('Date'),
    decimal: new PrimitiveIdentifierNode('number'),
    double: new PrimitiveIdentifierNode('number'),
    float: new PrimitiveIdentifierNode('number'),
    image: new AliasIdentifierNode('Buffer'),
    int: new PrimitiveIdentifierNode('number'),
    money: new PrimitiveIdentifierNode('number'),
    nchar: new PrimitiveIdentifierNode('string'),
    ntext: new PrimitiveIdentifierNode('string'),
    number: new PrimitiveIdentifierNode('number'),
    numeric: new PrimitiveIdentifierNode('number'),
    nvarchar: new PrimitiveIdentifierNode('string'),
    real: new PrimitiveIdentifierNode('number'),
    smalldatetime: new AliasIdentifierNode('Date'),
    smallint: new PrimitiveIdentifierNode('number'),
    smallmoney: new PrimitiveIdentifierNode('number'),
    text: new PrimitiveIdentifierNode('string'),
    time: new AliasIdentifierNode('Date'),
    tinyint: new PrimitiveIdentifierNode('number'),
    tvp: new PrimitiveIdentifierNode('unknown'),
    uniqueidentifier: new PrimitiveIdentifierNode('string'),
    varbinary: new AliasIdentifierNode('Buffer'),
    varchar: new PrimitiveIdentifierNode('string'),
  };
}

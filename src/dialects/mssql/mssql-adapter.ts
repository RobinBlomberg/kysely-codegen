import { IdentifierNode } from '../../ast';
import { Adapter } from '../../core';

export class MssqlAdapter extends Adapter {
  // https://github.com/tediousjs/tedious/tree/master/src/data-types
  override readonly scalars = {
    bigint: new IdentifierNode('number'),
    binary: new IdentifierNode('Buffer'),
    bit: new IdentifierNode('boolean'),
    char: new IdentifierNode('string'),
    date: new IdentifierNode('Date'),
    datetime: new IdentifierNode('Date'),
    datetime2: new IdentifierNode('Date'),
    datetimeoffset: new IdentifierNode('Date'),
    decimal: new IdentifierNode('number'),
    double: new IdentifierNode('number'),
    float: new IdentifierNode('number'),
    image: new IdentifierNode('Buffer'),
    int: new IdentifierNode('number'),
    money: new IdentifierNode('number'),
    nchar: new IdentifierNode('string'),
    ntext: new IdentifierNode('string'),
    number: new IdentifierNode('number'),
    numeric: new IdentifierNode('number'),
    nvarchar: new IdentifierNode('string'),
    real: new IdentifierNode('number'),
    smalldatetime: new IdentifierNode('Date'),
    smallint: new IdentifierNode('number'),
    smallmoney: new IdentifierNode('number'),
    text: new IdentifierNode('string'),
    time: new IdentifierNode('Date'),
    tinyint: new IdentifierNode('number'),
    tvp: new IdentifierNode('unknown'),
    uniqueidentifier: new IdentifierNode('string'),
    varbinary: new IdentifierNode('Buffer'),
    varchar: new IdentifierNode('string'),
  };
}

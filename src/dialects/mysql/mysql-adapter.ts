import { Adapter } from '../../adapter';
import { ArrayExpressionNode } from '../../nodes/array-expression-node';
import { IdentifierNode } from '../../nodes/identifier-node';
import { ObjectExpressionNode } from '../../nodes/object-expression-node';
import { PropertyNode } from '../../nodes/property-node';
import { UnionExpressionNode } from '../../nodes/union-expression-node';

export class MysqlAdapter extends Adapter {
  override readonly definitions = {
    Geometry: new UnionExpressionNode([
      new IdentifierNode('LineString'),
      new IdentifierNode('Point'),
      new IdentifierNode('Polygon'),
      new ArrayExpressionNode(new IdentifierNode('Geometry')),
    ]),
    LineString: new ArrayExpressionNode(new IdentifierNode('Point')),
    Point: new ObjectExpressionNode([
      new PropertyNode('x', new IdentifierNode('number')),
      new PropertyNode('y', new IdentifierNode('number')),
    ]),
    Polygon: new ArrayExpressionNode(new IdentifierNode('LineString')),
  };
  // These types have been found through experimentation in Adminer.
  override readonly types = {
    bigint: new IdentifierNode('number'),
    binary: new IdentifierNode('Buffer'),
    bit: new IdentifierNode('Buffer'),
    blob: new IdentifierNode('Buffer'),
    char: new IdentifierNode('string'),
    date: new IdentifierNode('Date'),
    datetime: new IdentifierNode('Date'),
    decimal: new IdentifierNode('string'),
    double: new IdentifierNode('number'),
    enum: new IdentifierNode('unknown'),
    float: new IdentifierNode('number'),
    geomcollection: new ArrayExpressionNode(new IdentifierNode('Geometry')), // Specified as "geometrycollection" in Adminer.
    geometry: new IdentifierNode('Geometry'),
    int: new IdentifierNode('number'),
    json: new IdentifierNode('string'),
    linestring: new IdentifierNode('LineString'),
    longblob: new IdentifierNode('Buffer'),
    longtext: new IdentifierNode('string'),
    mediumblob: new IdentifierNode('Buffer'),
    mediumint: new IdentifierNode('number'),
    mediumtext: new IdentifierNode('string'),
    multilinestring: new ArrayExpressionNode(new IdentifierNode('LineString')),
    multipoint: new ArrayExpressionNode(new IdentifierNode('Point')),
    multipolygon: new ArrayExpressionNode(new IdentifierNode('Polygon')),
    point: new IdentifierNode('Point'),
    polygon: new IdentifierNode('Polygon'),
    set: new IdentifierNode('unknown'),
    smallint: new IdentifierNode('number'),
    text: new IdentifierNode('string'),
    time: new IdentifierNode('string'),
    timestamp: new IdentifierNode('Date'),
    tinyblob: new IdentifierNode('Buffer'),
    tinyint: new IdentifierNode('number'),
    tinytext: new IdentifierNode('string'),
    varbinary: new IdentifierNode('Buffer'),
    varchar: new IdentifierNode('string'),
    year: new IdentifierNode('number'),
  };
}

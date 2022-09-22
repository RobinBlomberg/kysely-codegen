import { Adapter } from '../../adapter';
import {
  JSON_ARRAY_DEFINITION,
  JSON_OBJECT_DEFINITION,
  JSON_PRIMITIVE_DEFINITION,
  JSON_VALUE_DEFINITION,
} from '../../constants';
import {
  ArrayExpressionNode,
  IdentifierNode,
  ObjectExpressionNode,
  PropertyNode,
  UnionExpressionNode,
} from '../../nodes';
import { ColumnType } from '../../nodes/column-type-node';

export class MysqlAdapter extends Adapter {
  override readonly definitions = {
    Decimal: new ColumnType(
      new IdentifierNode('string'),
      new UnionExpressionNode([
        new IdentifierNode('string'),
        new IdentifierNode('number'),
      ]),
    ),
    Geometry: new UnionExpressionNode([
      new IdentifierNode('LineString'),
      new IdentifierNode('Point'),
      new IdentifierNode('Polygon'),
      new ArrayExpressionNode(new IdentifierNode('Geometry')),
    ]),
    Json: new ColumnType(
      new IdentifierNode('JsonValue'),
      new IdentifierNode('string'),
      new IdentifierNode('string'),
    ),
    JsonArray: JSON_ARRAY_DEFINITION,
    JsonObject: JSON_OBJECT_DEFINITION,
    JsonPrimitive: JSON_PRIMITIVE_DEFINITION,
    JsonValue: JSON_VALUE_DEFINITION,
    LineString: new ArrayExpressionNode(new IdentifierNode('Point')),
    Point: new ObjectExpressionNode([
      new PropertyNode('x', new IdentifierNode('number')),
      new PropertyNode('y', new IdentifierNode('number')),
    ]),
    Polygon: new ArrayExpressionNode(new IdentifierNode('LineString')),
  };
  // These types have been found through experimentation in Adminer.
  override readonly scalars = {
    bigint: new IdentifierNode('number'),
    binary: new IdentifierNode('Buffer'),
    bit: new IdentifierNode('Buffer'),
    blob: new IdentifierNode('Buffer'),
    char: new IdentifierNode('string'),
    date: new IdentifierNode('Date'),
    datetime: new IdentifierNode('Date'),
    decimal: new IdentifierNode('Decimal'),
    double: new IdentifierNode('number'),
    float: new IdentifierNode('number'),
    geomcollection: new ArrayExpressionNode(new IdentifierNode('Geometry')), // Specified as "geometrycollection" in Adminer.
    geometry: new IdentifierNode('Geometry'),
    int: new IdentifierNode('number'),
    json: new IdentifierNode('Json'),
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

import { Adapter } from '../../adapter';
import { ArrayExpressionNode } from '../../ast/array-expression-node';
import { ColumnTypeNode } from '../../ast/column-type-node';
import {
  AliasIdentifierNode,
  PrimitiveIdentifierNode,
} from '../../ast/identifier-node';
import { ObjectExpressionNode } from '../../ast/object-expression-node';
import { PropertyNode } from '../../ast/property-node';
import { UnionExpressionNode } from '../../ast/union-expression-node';
import {
  JSON_ARRAY_DEFINITION,
  JSON_OBJECT_DEFINITION,
  JSON_PRIMITIVE_DEFINITION,
  JSON_VALUE_DEFINITION,
} from '../../transformer/definitions';

export class MysqlAdapter extends Adapter {
  override readonly definitions = {
    Decimal: new ColumnTypeNode(
      new PrimitiveIdentifierNode('string'),
      new UnionExpressionNode([
        new PrimitiveIdentifierNode('string'),
        new PrimitiveIdentifierNode('number'),
      ]),
    ),
    Geometry: new UnionExpressionNode([
      new AliasIdentifierNode('LineString'),
      new AliasIdentifierNode('Point'),
      new AliasIdentifierNode('Polygon'),
      new ArrayExpressionNode(new AliasIdentifierNode('Geometry')),
    ]),
    Json: new ColumnTypeNode(
      new AliasIdentifierNode('JsonValue'),
      new PrimitiveIdentifierNode('string'),
      new PrimitiveIdentifierNode('string'),
    ),
    JsonArray: JSON_ARRAY_DEFINITION,
    JsonObject: JSON_OBJECT_DEFINITION,
    JsonPrimitive: JSON_PRIMITIVE_DEFINITION,
    JsonValue: JSON_VALUE_DEFINITION,
    LineString: new ArrayExpressionNode(new AliasIdentifierNode('Point')),
    Point: new ObjectExpressionNode([
      new PropertyNode('x', new PrimitiveIdentifierNode('number')),
      new PropertyNode('y', new PrimitiveIdentifierNode('number')),
    ]),
    Polygon: new ArrayExpressionNode(new AliasIdentifierNode('LineString')),
  };
  // These types have been found through experimentation in Adminer.
  override readonly scalars = {
    bigint: new PrimitiveIdentifierNode('number'),
    binary: new AliasIdentifierNode('Buffer'),
    bit: new AliasIdentifierNode('Buffer'),
    blob: new AliasIdentifierNode('Buffer'),
    char: new PrimitiveIdentifierNode('string'),
    date: new AliasIdentifierNode('Date'),
    datetime: new AliasIdentifierNode('Date'),
    decimal: new AliasIdentifierNode('Decimal'),
    double: new PrimitiveIdentifierNode('number'),
    float: new PrimitiveIdentifierNode('number'),
    geomcollection: new ArrayExpressionNode(
      new AliasIdentifierNode('Geometry'),
    ), // Specified as "geometrycollection" in Adminer.
    geometry: new AliasIdentifierNode('Geometry'),
    int: new PrimitiveIdentifierNode('number'),
    json: new AliasIdentifierNode('Json'),
    linestring: new AliasIdentifierNode('LineString'),
    longblob: new AliasIdentifierNode('Buffer'),
    longtext: new PrimitiveIdentifierNode('string'),
    mediumblob: new AliasIdentifierNode('Buffer'),
    mediumint: new PrimitiveIdentifierNode('number'),
    mediumtext: new PrimitiveIdentifierNode('string'),
    multilinestring: new ArrayExpressionNode(
      new AliasIdentifierNode('LineString'),
    ),
    multipoint: new ArrayExpressionNode(new AliasIdentifierNode('Point')),
    multipolygon: new ArrayExpressionNode(new AliasIdentifierNode('Polygon')),
    point: new AliasIdentifierNode('Point'),
    polygon: new AliasIdentifierNode('Polygon'),
    set: new PrimitiveIdentifierNode('unknown'),
    smallint: new PrimitiveIdentifierNode('number'),
    text: new PrimitiveIdentifierNode('string'),
    time: new PrimitiveIdentifierNode('string'),
    timestamp: new AliasIdentifierNode('Date'),
    tinyblob: new AliasIdentifierNode('Buffer'),
    tinyint: new PrimitiveIdentifierNode('number'),
    tinytext: new PrimitiveIdentifierNode('string'),
    varbinary: new AliasIdentifierNode('Buffer'),
    varchar: new PrimitiveIdentifierNode('string'),
    year: new PrimitiveIdentifierNode('number'),
  };
}

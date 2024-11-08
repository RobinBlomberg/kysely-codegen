import { DateParser } from '../../../introspector/dialects/postgres/date-parser';
import { NumericParser } from '../../../introspector/dialects/postgres/numeric-parser';
import { Adapter } from '../../adapter';
import { ColumnTypeNode } from '../../ast/column-type-node';
import {
  AliasIdentifierNode,
  PrimitiveIdentifierNode,
} from '../../ast/identifier-node';
import { ModuleReferenceNode } from '../../ast/module-reference-node';
import { ObjectExpressionNode } from '../../ast/object-expression-node';
import { PropertyNode } from '../../ast/property-node';
import { UnionExpressionNode } from '../../ast/union-expression-node';
import {
  JSON_ARRAY_DEFINITION,
  JSON_DEFINITION,
  JSON_OBJECT_DEFINITION,
  JSON_PRIMITIVE_DEFINITION,
  JSON_VALUE_DEFINITION,
} from '../../transformer/definitions';

type PostgresAdapterOptions = {
  dateParser?: DateParser;
  numericParser?: NumericParser;
};

export class PostgresAdapter extends Adapter {
  // From https://node-postgres.com/features/types:
  // "node-postgres will convert a database type to a JavaScript string if it doesn't have a
  // registered type parser for the database type. Furthermore, you can send any type to the
  // PostgreSQL server as a string and node-postgres will pass it through without modifying it in
  // any way."
  override readonly defaultScalar = new PrimitiveIdentifierNode('string');
  override readonly defaultSchemas = ['public'];
  override readonly definitions = {
    Circle: new ObjectExpressionNode([
      new PropertyNode('x', new PrimitiveIdentifierNode('number')),
      new PropertyNode('y', new PrimitiveIdentifierNode('number')),
      new PropertyNode('radius', new PrimitiveIdentifierNode('number')),
    ]),
    Int8: new ColumnTypeNode(
      new PrimitiveIdentifierNode('string'),
      new UnionExpressionNode([
        new PrimitiveIdentifierNode('string'),
        new PrimitiveIdentifierNode('number'),
        new PrimitiveIdentifierNode('bigint'),
      ]),
      new UnionExpressionNode([
        new PrimitiveIdentifierNode('string'),
        new PrimitiveIdentifierNode('number'),
        new PrimitiveIdentifierNode('bigint'),
      ]),
    ),
    Interval: new ColumnTypeNode(
      new AliasIdentifierNode('IPostgresInterval'),
      new UnionExpressionNode([
        new AliasIdentifierNode('IPostgresInterval'),
        new PrimitiveIdentifierNode('number'),
        new PrimitiveIdentifierNode('string'),
      ]),
      new UnionExpressionNode([
        new AliasIdentifierNode('IPostgresInterval'),
        new PrimitiveIdentifierNode('number'),
        new PrimitiveIdentifierNode('string'),
      ]),
    ),
    Json: JSON_DEFINITION,
    JsonArray: JSON_ARRAY_DEFINITION,
    JsonObject: JSON_OBJECT_DEFINITION,
    JsonPrimitive: JSON_PRIMITIVE_DEFINITION,
    JsonValue: JSON_VALUE_DEFINITION,
    Numeric: new ColumnTypeNode(
      new PrimitiveIdentifierNode('string'),
      new UnionExpressionNode([
        new PrimitiveIdentifierNode('number'),
        new PrimitiveIdentifierNode('string'),
      ]),
      new UnionExpressionNode([
        new PrimitiveIdentifierNode('number'),
        new PrimitiveIdentifierNode('string'),
      ]),
    ),
    Point: new ObjectExpressionNode([
      new PropertyNode('x', new PrimitiveIdentifierNode('number')),
      new PropertyNode('y', new PrimitiveIdentifierNode('number')),
    ]),
    Timestamp: new ColumnTypeNode(
      new AliasIdentifierNode('Date'),
      new UnionExpressionNode([
        new AliasIdentifierNode('Date'),
        new PrimitiveIdentifierNode('string'),
      ]),
      new UnionExpressionNode([
        new AliasIdentifierNode('Date'),
        new PrimitiveIdentifierNode('string'),
      ]),
    ),
  };
  override readonly imports = {
    IPostgresInterval: new ModuleReferenceNode('postgres-interval'),
  };
  // These types have been found through experimentation in Adminer and in the 'pg' source code.
  override readonly scalars = {
    bit: new PrimitiveIdentifierNode('string'),
    bool: new PrimitiveIdentifierNode('boolean'), // Specified as "boolean" in Adminer.
    box: new PrimitiveIdentifierNode('string'),
    bpchar: new PrimitiveIdentifierNode('string'), // Specified as "character" in Adminer.
    bytea: new AliasIdentifierNode('Buffer'),
    cidr: new PrimitiveIdentifierNode('string'),
    circle: new AliasIdentifierNode('Circle'),
    date: new AliasIdentifierNode('Timestamp'),
    float4: new PrimitiveIdentifierNode('number'), // Specified as "real" in Adminer.
    float8: new PrimitiveIdentifierNode('number'), // Specified as "double precision" in Adminer.
    inet: new PrimitiveIdentifierNode('string'),
    int2: new PrimitiveIdentifierNode('number'), // Specified in 'pg' source code.
    int4: new PrimitiveIdentifierNode('number'), // Specified in 'pg' source code.
    int8: new AliasIdentifierNode('Int8'), // Specified as "bigint" in Adminer.
    interval: new AliasIdentifierNode('Interval'),
    json: new AliasIdentifierNode('Json'),
    jsonb: new AliasIdentifierNode('Json'),
    line: new PrimitiveIdentifierNode('string'),
    lseg: new PrimitiveIdentifierNode('string'),
    macaddr: new PrimitiveIdentifierNode('string'),
    money: new PrimitiveIdentifierNode('string'),
    numeric: new AliasIdentifierNode('Numeric'),
    oid: new PrimitiveIdentifierNode('number'), // Specified in 'pg' source code.
    path: new PrimitiveIdentifierNode('string'),
    point: new AliasIdentifierNode('Point'),
    polygon: new PrimitiveIdentifierNode('string'),
    text: new PrimitiveIdentifierNode('string'),
    time: new PrimitiveIdentifierNode('string'),
    timestamp: new AliasIdentifierNode('Timestamp'),
    timestamptz: new AliasIdentifierNode('Timestamp'),
    tsquery: new PrimitiveIdentifierNode('string'),
    tsvector: new PrimitiveIdentifierNode('string'),
    txid_snapshot: new PrimitiveIdentifierNode('string'),
    uuid: new PrimitiveIdentifierNode('string'),
    varbit: new PrimitiveIdentifierNode('string'), // Specified as "bit varying" in Adminer.
    varchar: new PrimitiveIdentifierNode('string'), // Specified as "character varying" in Adminer.
    xml: new PrimitiveIdentifierNode('string'),
  };

  constructor(options?: PostgresAdapterOptions) {
    super();

    if (options?.dateParser === DateParser.STRING) {
      this.scalars.date = new PrimitiveIdentifierNode('string');
    } else {
      this.scalars.date = new AliasIdentifierNode('Timestamp');
    }

    if (options?.numericParser === NumericParser.NUMBER) {
      this.definitions.Numeric = new ColumnTypeNode(
        new PrimitiveIdentifierNode('number'),
        new UnionExpressionNode([
          new PrimitiveIdentifierNode('number'),
          new PrimitiveIdentifierNode('string'),
        ]),
        new UnionExpressionNode([
          new PrimitiveIdentifierNode('number'),
          new PrimitiveIdentifierNode('string'),
        ]),
      );
    } else if (options?.numericParser === NumericParser.NUMBER_OR_STRING) {
      this.definitions.Numeric = new ColumnTypeNode(
        new UnionExpressionNode([
          new PrimitiveIdentifierNode('number'),
          new PrimitiveIdentifierNode('string'),
        ]),
      );
    }
  }
}

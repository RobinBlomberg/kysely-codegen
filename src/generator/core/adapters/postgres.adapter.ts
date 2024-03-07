import { ColumnType } from '../../ast/column-type-node.js';
import { IdentifierNode } from '../../ast/identifier-node.js';
import { ModuleReferenceNode } from '../../ast/module-reference-node.js';
import { ObjectExpressionNode } from '../../ast/object-expression-node.js';
import { PropertyNode } from '../../ast/property-node.js';
import { UnionExpressionNode } from '../../ast/union-expression-node.js';
import {
  JSON_ARRAY_DEFINITION,
  JSON_DEFINITION,
  JSON_OBJECT_DEFINITION,
  JSON_PRIMITIVE_DEFINITION,
  JSON_VALUE_DEFINITION,
} from '../../transformer/definitions.js';
import type { DefinitionMap } from '../adapter.js';
import { createGeneratorAdapter } from '../adapter.js';

export const postgresDefinitions = {
  Circle: new ObjectExpressionNode([
    new PropertyNode('x', new IdentifierNode('number')),
    new PropertyNode('y', new IdentifierNode('number')),
    new PropertyNode('radius', new IdentifierNode('number')),
  ]),
  Int8: new ColumnType(
    new IdentifierNode('string'),
    new UnionExpressionNode([
      new IdentifierNode('string'),
      new IdentifierNode('number'),
      new IdentifierNode('bigint'),
    ]),
  ),
  Interval: new ColumnType(
    new IdentifierNode('IPostgresInterval'),
    new UnionExpressionNode([
      new IdentifierNode('IPostgresInterval'),
      new IdentifierNode('number'),
    ]),
  ),
  Json: JSON_DEFINITION,
  JsonArray: JSON_ARRAY_DEFINITION,
  JsonObject: JSON_OBJECT_DEFINITION,
  JsonPrimitive: JSON_PRIMITIVE_DEFINITION,
  JsonValue: JSON_VALUE_DEFINITION,
  Numeric: new ColumnType(
    new IdentifierNode('string'),
    new UnionExpressionNode([
      new IdentifierNode('string'),
      new IdentifierNode('number'),
    ]),
  ),
  Point: new ObjectExpressionNode([
    new PropertyNode('x', new IdentifierNode('number')),
    new PropertyNode('y', new IdentifierNode('number')),
  ]),
  Timestamp: new ColumnType(
    new IdentifierNode('Date'),
    new UnionExpressionNode([
      new IdentifierNode('Date'),
      new IdentifierNode('string'),
    ]),
  ),
} satisfies DefinitionMap;

export const postgresAdapter = createGeneratorAdapter({
  // From https://node-postgres.com/features/types:
  // "node-postgres will convert a database type to a JavaScript string if it doesn't have a
  // registered type parser for the database type. Furthermore, you can send any type to the
  // PostgreSQL server as a string and node-postgres will pass it through without modifying it in
  // any way."
  defaultScalar: new IdentifierNode('string'),
  defaultSchema: 'public',
  definitions: postgresDefinitions,
  imports: {
    IPostgresInterval: new ModuleReferenceNode('postgres-interval'),
  },
  // These types have been found through experimentation in Adminer and in the 'pg' source code.
  scalars: {
    bit: new IdentifierNode('string'),
    bool: new IdentifierNode('boolean'), // Specified as "boolean" in Adminer.
    box: new IdentifierNode('string'),
    bpchar: new IdentifierNode('string'), // Specified as "character" in Adminer.
    bytea: new IdentifierNode('Buffer'),
    cidr: new IdentifierNode('string'),
    circle: new IdentifierNode('Circle'),
    date: new IdentifierNode('Timestamp'),
    float4: new IdentifierNode('number'), // Specified as "real" in Adminer.
    float8: new IdentifierNode('number'), // Specified as "double precision" in Adminer.
    inet: new IdentifierNode('string'),
    int2: new IdentifierNode('number'), // Specified in 'pg' source code.
    int4: new IdentifierNode('number'), // Specified in 'pg' source code.
    int8: new IdentifierNode('Int8'), // Specified as "bigint" in Adminer.
    interval: new IdentifierNode('Interval'),
    json: new IdentifierNode('Json'),
    jsonb: new IdentifierNode('Json'),
    line: new IdentifierNode('string'),
    lseg: new IdentifierNode('string'),
    macaddr: new IdentifierNode('string'),
    money: new IdentifierNode('string'),
    numeric: new IdentifierNode('Numeric'),
    oid: new IdentifierNode('number'), // Specified in 'pg' source code.
    path: new IdentifierNode('string'),
    point: new IdentifierNode('Point'),
    polygon: new IdentifierNode('string'),
    text: new IdentifierNode('string'),
    time: new IdentifierNode('string'),
    timestamp: new IdentifierNode('Timestamp'),
    timestamptz: new IdentifierNode('Timestamp'),
    tsquery: new IdentifierNode('string'),
    tsvector: new IdentifierNode('string'),
    txid_snapshot: new IdentifierNode('string'),
    uuid: new IdentifierNode('string'),
    varbit: new IdentifierNode('string'), // Specified as "bit varying" in Adminer.
    varchar: new IdentifierNode('string'), // Specified as "character varying" in Adminer.
    xml: new IdentifierNode('string'),
  },
});

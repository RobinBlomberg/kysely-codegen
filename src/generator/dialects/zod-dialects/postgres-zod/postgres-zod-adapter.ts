import type { NumericParser } from "../../../../introspector";
import { Adapter } from "../../../adapter";
import { IdentifierNode } from "../../../ast/identifier-node";
import { ObjectExpressionNode } from "../../../ast/object-expression-node";
import { PropertyNode } from "../../../ast/property-node";
import { RawExpressionNode } from "../../../ast/raw-expression-node";
import { UnionExpressionNode } from "../../../ast/union-expression-node";
import { JSON_SCHEMA_DEFINITION } from "../../../transformer/zod/zod-definitions";


type PostgresAdapterOptions = {
  numericParser?: NumericParser;
};

export class PostgresZodAdapter extends Adapter {
  // From https://node-postgres.com/features/types:
  // "node-postgres will convert a database type to a JavaScript z.string() if it doesn't have a
  // registered type parser for the database type. Furthermore, you can send any type to the
  // PostgreSQL server as a z.string() and node-postgres will pass it through without modifying it in
  // any way."
  override readonly defaultScalar = new IdentifierNode('z.string()');
  override readonly defaultSchemas = ['public'];
  override readonly definitions = {
    Circle: new ObjectExpressionNode([
      new PropertyNode('x', new IdentifierNode('z.number()')),
      new PropertyNode('y', new IdentifierNode('z.number()')),
      new PropertyNode('radius', new IdentifierNode('z.number()')),
    ]),
    IntervalSchema:
      new UnionExpressionNode([
        new IdentifierNode('PostgresIntervalSchema', new RawExpressionNode("z.lazy(() => PostgresIntervalSchema)")),
        new IdentifierNode('z.number()'),
        new IdentifierNode('z.string()'),
      ]),
    JsonSchema: JSON_SCHEMA_DEFINITION,
    NumericSchema: new IdentifierNode('z.coerce.number()'),
    PointSchema: new ObjectExpressionNode([
      new PropertyNode('x', new IdentifierNode('z.number()')),
      new PropertyNode('y', new IdentifierNode('z.number()')),
    ]),
    TimestampSchema: new UnionExpressionNode([
        new IdentifierNode('z.coerce.date()'),
        new IdentifierNode('z.string()'),
      ]),
    PostgresIntervalSchema: new IdentifierNode("PostgresIntervalSchema", new RawExpressionNode(`z.object({
        years: z.number().optional(),
        months: z.number().optional(),
        days: z.number().optional(),
        hours: z.number().optional(),
        minutes: z.number().optional(),
        seconds: z.number().optional(),
        milliseconds: z.number().optional(),
      })`)),
    BufferSchema: new RawExpressionNode(`
          z.custom<Buffer>((data) => {
            return Buffer.isBuffer(data);
          }, {
            message: "Invalid buffer", // Optional error message
          });`),
  };

  // These types have been found through experimentation in Adminer and in the 'pg' source code.
  override readonly scalars = {
    bit: new IdentifierNode('z.string()'),
    bool: new IdentifierNode('z.boolean()'), // Specified as "z.boolean()" in Adminer.
    box: new IdentifierNode('z.string()'),
    bpchar: new IdentifierNode('z.string()'), // Specified as "character" in Adminer.
    bytea: new IdentifierNode('BufferSchema'),
    cidr: new IdentifierNode('z.string()'),
    circle: new IdentifierNode('Circle'),
    date: new IdentifierNode('TimestampSchema'),
    float4: new IdentifierNode('z.number()'), // Specified as "real" in Adminer.
    float8: new IdentifierNode('z.number()'), // Specified as "double precision" in Adminer.
    inet: new IdentifierNode('z.string()'),
    int2: new IdentifierNode('z.number()'), // Specified in 'pg' source code.
    int4: new IdentifierNode('z.number()'), // Specified in 'pg' source code.
    int8: new IdentifierNode('z.coerce.number()'), // Specified as "bigint" in Adminer.
    interval: new IdentifierNode('IntervalSchema'),
    json: new IdentifierNode('JsonSchema'),
    jsonb: new IdentifierNode('JsonSchema'),
    line: new IdentifierNode('z.string()'),
    lseg: new IdentifierNode('z.string()'),
    macaddr: new IdentifierNode('z.string()'),
    money: new IdentifierNode('z.string()'),
    numeric: new IdentifierNode('NumericSchema'),
    oid: new IdentifierNode('z.number()'), // Specified in 'pg' source code.
    path: new IdentifierNode('z.string()'),
    point: new IdentifierNode('PointSchema'),
    polygon: new IdentifierNode('z.string()'),
    text: new IdentifierNode('z.string()'),
    time: new IdentifierNode('z.string()'),
    timestamp: new IdentifierNode('TimestampSchema'),
    timestamptz: new IdentifierNode('TimestampSchema'),
    tsquery: new IdentifierNode('z.string()'),
    tsvector: new IdentifierNode('z.string()'),
    txid_snapshot: new IdentifierNode('z.string()'),
    uuid: new IdentifierNode('z.string()'),
    varbit: new IdentifierNode('z.string()'), // Specified as "bit varying" in Adminer.
    varchar: new IdentifierNode('z.string()'), // Specified as "character varying" in Adminer.
    xml: new IdentifierNode('z.string()'),
  };

  constructor(options?: PostgresAdapterOptions) {
    super();
    this.definitions.NumericSchema = new IdentifierNode('z.coerce.number()');
  }
}

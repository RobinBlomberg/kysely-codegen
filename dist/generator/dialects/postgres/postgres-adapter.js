"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresAdapter = void 0;
const adapter_1 = require("../../adapter");
const column_type_node_1 = require("../../ast/column-type-node");
const identifier_node_1 = require("../../ast/identifier-node");
const module_reference_node_1 = require("../../ast/module-reference-node");
const object_expression_node_1 = require("../../ast/object-expression-node");
const property_node_1 = require("../../ast/property-node");
const union_expression_node_1 = require("../../ast/union-expression-node");
const definitions_1 = require("../../transformer/definitions");
class PostgresAdapter extends adapter_1.Adapter {
    constructor(options) {
        super();
        // From https://node-postgres.com/features/types:
        // "node-postgres will convert a database type to a JavaScript string if it doesn't have a
        // registered type parser for the database type. Furthermore, you can send any type to the
        // PostgreSQL server as a string and node-postgres will pass it through without modifying it in
        // any way."
        this.defaultScalar = new identifier_node_1.IdentifierNode('string');
        this.defaultSchemas = ['public'];
        this.definitions = {
            Circle: new object_expression_node_1.ObjectExpressionNode([
                new property_node_1.PropertyNode('x', new identifier_node_1.IdentifierNode('number')),
                new property_node_1.PropertyNode('y', new identifier_node_1.IdentifierNode('number')),
                new property_node_1.PropertyNode('radius', new identifier_node_1.IdentifierNode('number')),
            ]),
            Int8: new column_type_node_1.ColumnTypeNode(new identifier_node_1.IdentifierNode('string'), new union_expression_node_1.UnionExpressionNode([
                new identifier_node_1.IdentifierNode('string'),
                new identifier_node_1.IdentifierNode('number'),
                new identifier_node_1.IdentifierNode('bigint'),
            ]), new union_expression_node_1.UnionExpressionNode([
                new identifier_node_1.IdentifierNode('string'),
                new identifier_node_1.IdentifierNode('number'),
                new identifier_node_1.IdentifierNode('bigint'),
            ])),
            Interval: new column_type_node_1.ColumnTypeNode(new identifier_node_1.IdentifierNode('IPostgresInterval'), new union_expression_node_1.UnionExpressionNode([
                new identifier_node_1.IdentifierNode('IPostgresInterval'),
                new identifier_node_1.IdentifierNode('number'),
                new identifier_node_1.IdentifierNode('string'),
            ]), new union_expression_node_1.UnionExpressionNode([
                new identifier_node_1.IdentifierNode('IPostgresInterval'),
                new identifier_node_1.IdentifierNode('number'),
                new identifier_node_1.IdentifierNode('string'),
            ])),
            Json: definitions_1.JSON_DEFINITION,
            JsonArray: definitions_1.JSON_ARRAY_DEFINITION,
            JsonObject: definitions_1.JSON_OBJECT_DEFINITION,
            JsonPrimitive: definitions_1.JSON_PRIMITIVE_DEFINITION,
            JsonValue: definitions_1.JSON_VALUE_DEFINITION,
            Numeric: new column_type_node_1.ColumnTypeNode(new identifier_node_1.IdentifierNode('string'), new union_expression_node_1.UnionExpressionNode([
                new identifier_node_1.IdentifierNode('number'),
                new identifier_node_1.IdentifierNode('string'),
            ]), new union_expression_node_1.UnionExpressionNode([
                new identifier_node_1.IdentifierNode('number'),
                new identifier_node_1.IdentifierNode('string'),
            ])),
            Point: new object_expression_node_1.ObjectExpressionNode([
                new property_node_1.PropertyNode('x', new identifier_node_1.IdentifierNode('number')),
                new property_node_1.PropertyNode('y', new identifier_node_1.IdentifierNode('number')),
            ]),
            Timestamp: new column_type_node_1.ColumnTypeNode(new identifier_node_1.IdentifierNode('Date'), new union_expression_node_1.UnionExpressionNode([
                new identifier_node_1.IdentifierNode('Date'),
                new identifier_node_1.IdentifierNode('string'),
            ]), new union_expression_node_1.UnionExpressionNode([
                new identifier_node_1.IdentifierNode('Date'),
                new identifier_node_1.IdentifierNode('string'),
            ])),
        };
        this.imports = {
            IPostgresInterval: new module_reference_node_1.ModuleReferenceNode('postgres-interval'),
        };
        // These types have been found through experimentation in Adminer and in the 'pg' source code.
        this.scalars = {
            bit: new identifier_node_1.IdentifierNode('string'),
            bool: new identifier_node_1.IdentifierNode('boolean'), // Specified as "boolean" in Adminer.
            box: new identifier_node_1.IdentifierNode('string'),
            bpchar: new identifier_node_1.IdentifierNode('string'), // Specified as "character" in Adminer.
            bytea: new identifier_node_1.IdentifierNode('Buffer'),
            cidr: new identifier_node_1.IdentifierNode('string'),
            circle: new identifier_node_1.IdentifierNode('Circle'),
            date: new identifier_node_1.IdentifierNode('Timestamp'),
            float4: new identifier_node_1.IdentifierNode('number'), // Specified as "real" in Adminer.
            float8: new identifier_node_1.IdentifierNode('number'), // Specified as "double precision" in Adminer.
            inet: new identifier_node_1.IdentifierNode('string'),
            int2: new identifier_node_1.IdentifierNode('number'), // Specified in 'pg' source code.
            int4: new identifier_node_1.IdentifierNode('number'), // Specified in 'pg' source code.
            int8: new identifier_node_1.IdentifierNode('Int8'), // Specified as "bigint" in Adminer.
            interval: new identifier_node_1.IdentifierNode('Interval'),
            json: new identifier_node_1.IdentifierNode('Json'),
            jsonb: new identifier_node_1.IdentifierNode('Json'),
            line: new identifier_node_1.IdentifierNode('string'),
            lseg: new identifier_node_1.IdentifierNode('string'),
            macaddr: new identifier_node_1.IdentifierNode('string'),
            money: new identifier_node_1.IdentifierNode('string'),
            numeric: new identifier_node_1.IdentifierNode('Numeric'),
            oid: new identifier_node_1.IdentifierNode('number'), // Specified in 'pg' source code.
            path: new identifier_node_1.IdentifierNode('string'),
            point: new identifier_node_1.IdentifierNode('Point'),
            polygon: new identifier_node_1.IdentifierNode('string'),
            text: new identifier_node_1.IdentifierNode('string'),
            time: new identifier_node_1.IdentifierNode('string'),
            timestamp: new identifier_node_1.IdentifierNode('Timestamp'),
            timestamptz: new identifier_node_1.IdentifierNode('Timestamp'),
            tsquery: new identifier_node_1.IdentifierNode('string'),
            tsvector: new identifier_node_1.IdentifierNode('string'),
            txid_snapshot: new identifier_node_1.IdentifierNode('string'),
            uuid: new identifier_node_1.IdentifierNode('string'),
            varbit: new identifier_node_1.IdentifierNode('string'), // Specified as "bit varying" in Adminer.
            varchar: new identifier_node_1.IdentifierNode('string'), // Specified as "character varying" in Adminer.
            xml: new identifier_node_1.IdentifierNode('string'),
        };
        if (options?.dateParser === 'string') {
            this.scalars.date = new identifier_node_1.IdentifierNode('string');
        }
        else {
            this.scalars.date = new identifier_node_1.IdentifierNode('Timestamp');
        }
        if (options?.numericParser === 'number') {
            this.definitions.Numeric = new column_type_node_1.ColumnTypeNode(new identifier_node_1.IdentifierNode('number'), new union_expression_node_1.UnionExpressionNode([
                new identifier_node_1.IdentifierNode('number'),
                new identifier_node_1.IdentifierNode('string'),
            ]), new union_expression_node_1.UnionExpressionNode([
                new identifier_node_1.IdentifierNode('number'),
                new identifier_node_1.IdentifierNode('string'),
            ]));
        }
        else if (options?.numericParser === 'number-or-string') {
            this.definitions.Numeric = new column_type_node_1.ColumnTypeNode(new union_expression_node_1.UnionExpressionNode([
                new identifier_node_1.IdentifierNode('number'),
                new identifier_node_1.IdentifierNode('string'),
            ]));
        }
    }
}
exports.PostgresAdapter = PostgresAdapter;
//# sourceMappingURL=postgres-adapter.js.map
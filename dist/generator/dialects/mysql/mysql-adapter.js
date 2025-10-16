"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlAdapter = void 0;
const adapter_1 = require("../../adapter");
const array_expression_node_1 = require("../../ast/array-expression-node");
const column_type_node_1 = require("../../ast/column-type-node");
const identifier_node_1 = require("../../ast/identifier-node");
const object_expression_node_1 = require("../../ast/object-expression-node");
const property_node_1 = require("../../ast/property-node");
const union_expression_node_1 = require("../../ast/union-expression-node");
const definitions_1 = require("../../transformer/definitions");
class MysqlAdapter extends adapter_1.Adapter {
    constructor() {
        super(...arguments);
        this.definitions = {
            Decimal: new column_type_node_1.ColumnTypeNode(new identifier_node_1.IdentifierNode('string'), new union_expression_node_1.UnionExpressionNode([
                new identifier_node_1.IdentifierNode('string'),
                new identifier_node_1.IdentifierNode('number'),
            ])),
            Geometry: new union_expression_node_1.UnionExpressionNode([
                new identifier_node_1.IdentifierNode('LineString'),
                new identifier_node_1.IdentifierNode('Point'),
                new identifier_node_1.IdentifierNode('Polygon'),
                new array_expression_node_1.ArrayExpressionNode(new identifier_node_1.IdentifierNode('Geometry')),
            ]),
            Json: new column_type_node_1.ColumnTypeNode(new identifier_node_1.IdentifierNode('JsonValue'), new identifier_node_1.IdentifierNode('string'), new identifier_node_1.IdentifierNode('string')),
            JsonArray: definitions_1.JSON_ARRAY_DEFINITION,
            JsonObject: definitions_1.JSON_OBJECT_DEFINITION,
            JsonPrimitive: definitions_1.JSON_PRIMITIVE_DEFINITION,
            JsonValue: definitions_1.JSON_VALUE_DEFINITION,
            LineString: new array_expression_node_1.ArrayExpressionNode(new identifier_node_1.IdentifierNode('Point')),
            Point: new object_expression_node_1.ObjectExpressionNode([
                new property_node_1.PropertyNode('x', new identifier_node_1.IdentifierNode('number')),
                new property_node_1.PropertyNode('y', new identifier_node_1.IdentifierNode('number')),
            ]),
            Polygon: new array_expression_node_1.ArrayExpressionNode(new identifier_node_1.IdentifierNode('LineString')),
        };
        // These types have been found through experimentation in Adminer.
        this.scalars = {
            bigint: new identifier_node_1.IdentifierNode('number'),
            binary: new identifier_node_1.IdentifierNode('Buffer'),
            bit: new identifier_node_1.IdentifierNode('Buffer'),
            blob: new identifier_node_1.IdentifierNode('Buffer'),
            char: new identifier_node_1.IdentifierNode('string'),
            date: new identifier_node_1.IdentifierNode('Date'),
            datetime: new identifier_node_1.IdentifierNode('Date'),
            decimal: new identifier_node_1.IdentifierNode('Decimal'),
            double: new identifier_node_1.IdentifierNode('number'),
            float: new identifier_node_1.IdentifierNode('number'),
            geomcollection: new array_expression_node_1.ArrayExpressionNode(new identifier_node_1.IdentifierNode('Geometry')), // Specified as "geometrycollection" in Adminer.
            geometry: new identifier_node_1.IdentifierNode('Geometry'),
            int: new identifier_node_1.IdentifierNode('number'),
            json: new identifier_node_1.IdentifierNode('Json'),
            linestring: new identifier_node_1.IdentifierNode('LineString'),
            longblob: new identifier_node_1.IdentifierNode('Buffer'),
            longtext: new identifier_node_1.IdentifierNode('string'),
            mediumblob: new identifier_node_1.IdentifierNode('Buffer'),
            mediumint: new identifier_node_1.IdentifierNode('number'),
            mediumtext: new identifier_node_1.IdentifierNode('string'),
            multilinestring: new array_expression_node_1.ArrayExpressionNode(new identifier_node_1.IdentifierNode('LineString')),
            multipoint: new array_expression_node_1.ArrayExpressionNode(new identifier_node_1.IdentifierNode('Point')),
            multipolygon: new array_expression_node_1.ArrayExpressionNode(new identifier_node_1.IdentifierNode('Polygon')),
            point: new identifier_node_1.IdentifierNode('Point'),
            polygon: new identifier_node_1.IdentifierNode('Polygon'),
            set: new identifier_node_1.IdentifierNode('unknown'),
            smallint: new identifier_node_1.IdentifierNode('number'),
            text: new identifier_node_1.IdentifierNode('string'),
            time: new identifier_node_1.IdentifierNode('string'),
            timestamp: new identifier_node_1.IdentifierNode('Date'),
            tinyblob: new identifier_node_1.IdentifierNode('Buffer'),
            tinyint: new identifier_node_1.IdentifierNode('number'),
            tinytext: new identifier_node_1.IdentifierNode('string'),
            varbinary: new identifier_node_1.IdentifierNode('Buffer'),
            varchar: new identifier_node_1.IdentifierNode('string'),
            year: new identifier_node_1.IdentifierNode('number'),
        };
    }
}
exports.MysqlAdapter = MysqlAdapter;
//# sourceMappingURL=mysql-adapter.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSON_DEFINITION = exports.JSON_VALUE_DEFINITION = exports.JSON_PRIMITIVE_DEFINITION = exports.JSON_OBJECT_DEFINITION = exports.JSON_ARRAY_DEFINITION = exports.GLOBAL_DEFINITIONS = void 0;
const array_expression_node_1 = require("../ast/array-expression-node");
const column_type_node_1 = require("../ast/column-type-node");
const extends_clause_node_1 = require("../ast/extends-clause-node");
const generic_expression_node_1 = require("../ast/generic-expression-node");
const identifier_node_1 = require("../ast/identifier-node");
const infer_clause_node_1 = require("../ast/infer-clause-node");
const mapped_type_node_1 = require("../ast/mapped-type-node");
const template_node_1 = require("../ast/template-node");
const union_expression_node_1 = require("../ast/union-expression-node");
exports.GLOBAL_DEFINITIONS = {
    /**
     * @see https://github.com/RobinBlomberg/kysely-codegen/issues/135
     */
    ArrayType: new template_node_1.TemplateNode(['T'], new extends_clause_node_1.ExtendsClauseNode(new generic_expression_node_1.GenericExpressionNode('ArrayTypeImpl', [new identifier_node_1.IdentifierNode('T')]), new array_expression_node_1.ArrayExpressionNode(new infer_clause_node_1.InferClauseNode('U')), new array_expression_node_1.ArrayExpressionNode(new identifier_node_1.IdentifierNode('U')), new generic_expression_node_1.GenericExpressionNode('ArrayTypeImpl', [new identifier_node_1.IdentifierNode('T')]))),
    /**
     * @see https://github.com/RobinBlomberg/kysely-codegen/issues/135
     */
    ArrayTypeImpl: new template_node_1.TemplateNode(['T'], new extends_clause_node_1.ExtendsClauseNode(new identifier_node_1.IdentifierNode('T'), new column_type_node_1.ColumnTypeNode(new infer_clause_node_1.InferClauseNode('S'), new infer_clause_node_1.InferClauseNode('I'), new infer_clause_node_1.InferClauseNode('U')), new column_type_node_1.ColumnTypeNode(new array_expression_node_1.ArrayExpressionNode(new identifier_node_1.IdentifierNode('S')), new array_expression_node_1.ArrayExpressionNode(new identifier_node_1.IdentifierNode('I')), new array_expression_node_1.ArrayExpressionNode(new identifier_node_1.IdentifierNode('U'))), new array_expression_node_1.ArrayExpressionNode(new identifier_node_1.IdentifierNode('T')))),
    Generated: new template_node_1.TemplateNode(['T'], new extends_clause_node_1.ExtendsClauseNode(new identifier_node_1.IdentifierNode('T'), new column_type_node_1.ColumnTypeNode(new infer_clause_node_1.InferClauseNode('S'), new infer_clause_node_1.InferClauseNode('I'), new infer_clause_node_1.InferClauseNode('U')), new column_type_node_1.ColumnTypeNode(new identifier_node_1.IdentifierNode('S'), new union_expression_node_1.UnionExpressionNode([
        new identifier_node_1.IdentifierNode('I'),
        new identifier_node_1.IdentifierNode('undefined'),
    ]), new identifier_node_1.IdentifierNode('U')), new column_type_node_1.ColumnTypeNode(new identifier_node_1.IdentifierNode('T'), new union_expression_node_1.UnionExpressionNode([
        new identifier_node_1.IdentifierNode('T'),
        new identifier_node_1.IdentifierNode('undefined'),
    ]), new identifier_node_1.IdentifierNode('T')))),
};
exports.JSON_ARRAY_DEFINITION = new array_expression_node_1.ArrayExpressionNode(new identifier_node_1.IdentifierNode('JsonValue'));
exports.JSON_OBJECT_DEFINITION = new mapped_type_node_1.MappedTypeNode(new identifier_node_1.IdentifierNode('JsonValue'));
exports.JSON_PRIMITIVE_DEFINITION = new union_expression_node_1.UnionExpressionNode([
    new identifier_node_1.IdentifierNode('boolean'),
    new identifier_node_1.IdentifierNode('null'),
    new identifier_node_1.IdentifierNode('number'),
    new identifier_node_1.IdentifierNode('string'),
]);
exports.JSON_VALUE_DEFINITION = new union_expression_node_1.UnionExpressionNode([
    new identifier_node_1.IdentifierNode('JsonArray'),
    new identifier_node_1.IdentifierNode('JsonObject'),
    new identifier_node_1.IdentifierNode('JsonPrimitive'),
]);
exports.JSON_DEFINITION = new identifier_node_1.IdentifierNode('JsonValue');
//# sourceMappingURL=definitions.js.map
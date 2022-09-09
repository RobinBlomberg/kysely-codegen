import { AdapterDefinitions } from '../adapter';
import { ArrayExpressionNode } from '../nodes';
import { ExpressionNode } from '../nodes/expression-node';
import { ExtendsClauseNode } from '../nodes/extends-clause-node';
import { GenericExpressionNode } from '../nodes/generic-expression-node';
import { IdentifierNode } from '../nodes/identifier-node';
import { InferClauseNode } from '../nodes/infer-clause-node';
import { MappedTypeNode } from '../nodes/mapped-type-node';
import { UnionExpressionNode } from '../nodes/union-expression-node';

export type Definition = ExpressionNode | [string[], ExpressionNode];

export const GLOBAL_DEFINITIONS: AdapterDefinitions = {
  Generated: [
    ['T'],
    new ExtendsClauseNode(
      'T',
      new GenericExpressionNode('ColumnType', [
        new InferClauseNode('S'),
        new InferClauseNode('I'),
        new InferClauseNode('U'),
      ]),
      new GenericExpressionNode('ColumnType', [
        new IdentifierNode('S'),
        new UnionExpressionNode([
          new IdentifierNode('I'),
          new IdentifierNode('undefined'),
        ]),
        new IdentifierNode('U'),
      ]),
      new GenericExpressionNode('ColumnType', [
        new IdentifierNode('T'),
        new UnionExpressionNode([
          new IdentifierNode('T'),
          new IdentifierNode('undefined'),
        ]),
        new IdentifierNode('T'),
      ]),
    ),
  ],
};

export const JSON_ARRAY_DEFINITION: Definition = new ArrayExpressionNode(
  new IdentifierNode('JsonValue'),
);

export const JSON_OBJECT_DEFINITION: Definition = new MappedTypeNode(
  new IdentifierNode('JsonValue'),
);

export const JSON_PRIMITIVE_DEFINITION: Definition = new UnionExpressionNode([
  new IdentifierNode('boolean'),
  new IdentifierNode('null'),
  new IdentifierNode('number'),
  new IdentifierNode('string'),
]);

export const JSON_VALUE_DEFINITION: Definition = new UnionExpressionNode([
  new IdentifierNode('JsonArray'),
  new IdentifierNode('JsonObject'),
  new IdentifierNode('JsonPrimitive'),
]);

import { ArrayExpressionNode } from '../ast/array-expression-node';
import { ColumnTypeNode } from '../ast/column-type-node';
import type { DefinitionNode } from '../ast/definition-node';
import { ExtendsClauseNode } from '../ast/extends-clause-node';
import { GenericExpressionNode } from '../ast/generic-expression-node';
import {
  AliasIdentifierNode,
  PrimitiveIdentifierNode,
} from '../ast/identifier-node';
import { InferClauseNode } from '../ast/infer-clause-node';
import { MappedTypeNode } from '../ast/mapped-type-node';
import { TemplateNode } from '../ast/template-node';
import { UnionExpressionNode } from '../ast/union-expression-node';

export const GLOBAL_DEFINITIONS = {
  /**
   * @see https://github.com/RobinBlomberg/kysely-codegen/issues/135
   */
  ArrayType: new TemplateNode(
    ['T'],
    new ExtendsClauseNode(
      new GenericExpressionNode('ArrayTypeImpl', [
        new AliasIdentifierNode('T'),
      ]),
      new ArrayExpressionNode(new InferClauseNode('U')),
      new ArrayExpressionNode(new AliasIdentifierNode('U')),
      new GenericExpressionNode('ArrayTypeImpl', [
        new AliasIdentifierNode('T'),
      ]),
    ),
  ),
  /**
   * @see https://github.com/RobinBlomberg/kysely-codegen/issues/135
   */
  ArrayTypeImpl: new TemplateNode(
    ['T'],
    new ExtendsClauseNode(
      new AliasIdentifierNode('T'),
      new ColumnTypeNode(
        new InferClauseNode('S'),
        new InferClauseNode('I'),
        new InferClauseNode('U'),
      ),
      new ColumnTypeNode(
        new ArrayExpressionNode(new AliasIdentifierNode('S')),
        new ArrayExpressionNode(new AliasIdentifierNode('I')),
        new ArrayExpressionNode(new AliasIdentifierNode('U')),
      ),
      new ArrayExpressionNode(new AliasIdentifierNode('T')),
    ),
  ),
  Generated: new TemplateNode(
    ['T'],
    new ExtendsClauseNode(
      new AliasIdentifierNode('T'),
      new ColumnTypeNode(
        new InferClauseNode('S'),
        new InferClauseNode('I'),
        new InferClauseNode('U'),
      ),
      new ColumnTypeNode(
        new AliasIdentifierNode('S'),
        new UnionExpressionNode([
          new AliasIdentifierNode('I'),
          new PrimitiveIdentifierNode('undefined'),
        ]),
        new AliasIdentifierNode('U'),
      ),
      new ColumnTypeNode(
        new AliasIdentifierNode('T'),
        new UnionExpressionNode([
          new AliasIdentifierNode('T'),
          new PrimitiveIdentifierNode('undefined'),
        ]),
        new AliasIdentifierNode('T'),
      ),
    ),
  ),
};

export const JSON_ARRAY_DEFINITION: DefinitionNode = new ArrayExpressionNode(
  new AliasIdentifierNode('JsonValue'),
);

export const JSON_OBJECT_DEFINITION: DefinitionNode = new MappedTypeNode(
  new AliasIdentifierNode('JsonValue'),
);

export const JSON_PRIMITIVE_DEFINITION: DefinitionNode =
  new UnionExpressionNode([
    new PrimitiveIdentifierNode('boolean'),
    new PrimitiveIdentifierNode('null'),
    new PrimitiveIdentifierNode('number'),
    new PrimitiveIdentifierNode('string'),
  ]);

export const JSON_VALUE_DEFINITION: DefinitionNode = new UnionExpressionNode([
  new AliasIdentifierNode('JsonArray'),
  new AliasIdentifierNode('JsonObject'),
  new AliasIdentifierNode('JsonPrimitive'),
]);

export const JSON_DEFINITION: DefinitionNode = new PrimitiveIdentifierNode(
  'JsonValue',
);

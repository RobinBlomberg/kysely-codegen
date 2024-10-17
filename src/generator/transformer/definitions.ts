import { ArrayExpressionNode } from '../ast/array-expression-node';
import { ColumnTypeNode } from '../ast/column-type-node';
import type { DefinitionNode } from '../ast/definition-node';
import { ExtendsClauseNode } from '../ast/extends-clause-node';
import { GenericExpressionNode } from '../ast/generic-expression-node';
import { IdentifierNode } from '../ast/identifier-node';
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
      new GenericExpressionNode('ArrayTypeImpl', [new IdentifierNode('T')]),
      new ArrayExpressionNode(new InferClauseNode('U')),
      new ArrayExpressionNode(new IdentifierNode('U')),
      new GenericExpressionNode('ArrayTypeImpl', [new IdentifierNode('T')]),
    ),
  ),
  /**
   * @see https://github.com/RobinBlomberg/kysely-codegen/issues/135
   */
  ArrayTypeImpl: new TemplateNode(
    ['T'],
    new ExtendsClauseNode(
      new IdentifierNode('T'),
      new ColumnTypeNode(
        new InferClauseNode('S'),
        new InferClauseNode('I'),
        new InferClauseNode('U'),
      ),
      new ColumnTypeNode(
        new ArrayExpressionNode(new IdentifierNode('S')),
        new ArrayExpressionNode(new IdentifierNode('I')),
        new ArrayExpressionNode(new IdentifierNode('U')),
      ),
      new ArrayExpressionNode(new IdentifierNode('T')),
    ),
  ),
  Generated: new TemplateNode(
    ['T'],
    new ExtendsClauseNode(
      new IdentifierNode('T'),
      new ColumnTypeNode(
        new InferClauseNode('S'),
        new InferClauseNode('I'),
        new InferClauseNode('U'),
      ),
      new ColumnTypeNode(
        new IdentifierNode('S'),
        new UnionExpressionNode([
          new IdentifierNode('I'),
          new IdentifierNode('undefined'),
        ]),
        new IdentifierNode('U'),
      ),
      new ColumnTypeNode(
        new IdentifierNode('T'),
        new UnionExpressionNode([
          new IdentifierNode('T'),
          new IdentifierNode('undefined'),
        ]),
        new IdentifierNode('T'),
      ),
    ),
  ),
};

export const JSON_ARRAY_DEFINITION: DefinitionNode = new ArrayExpressionNode(
  new IdentifierNode('JsonValue'),
);

export const JSON_OBJECT_DEFINITION: DefinitionNode = new MappedTypeNode(
  new IdentifierNode('JsonValue'),
);

export const JSON_PRIMITIVE_DEFINITION: DefinitionNode =
  new UnionExpressionNode([
    new IdentifierNode('boolean'),
    new IdentifierNode('null'),
    new IdentifierNode('number'),
    new IdentifierNode('string'),
  ]);

export const JSON_VALUE_DEFINITION: DefinitionNode = new UnionExpressionNode([
  new IdentifierNode('JsonArray'),
  new IdentifierNode('JsonObject'),
  new IdentifierNode('JsonPrimitive'),
]);

export const JSON_DEFINITION: DefinitionNode = new IdentifierNode('JsonValue');

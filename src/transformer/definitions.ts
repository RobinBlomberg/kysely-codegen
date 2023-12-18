import {
  ArrayExpressionNode,
  DefinitionNode,
  ExtendsClauseNode,
  GenericExpressionNode,
  IdentifierNode,
  InferClauseNode,
  MappedTypeNode,
  TemplateNode,
  UnionExpressionNode,
} from '../ast';

export const GLOBAL_DEFINITIONS = {
  ArrayType: new TemplateNode(
    ['T'],
    new ExtendsClauseNode(
      'T',
      new GenericExpressionNode('ColumnType', [
        new InferClauseNode('S'),
        new InferClauseNode('I'),
        new InferClauseNode('U'),
      ]),
      new GenericExpressionNode('ColumnType', [
        new ArrayExpressionNode(new IdentifierNode('S')),
        new ArrayExpressionNode(new IdentifierNode('I')),
        new ArrayExpressionNode(new IdentifierNode('U')),
      ]),
      new ArrayExpressionNode(new IdentifierNode('T')),
    ),
  ),
  Generated: new TemplateNode(
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

export const JSON_DEFINITION: DefinitionNode =new IdentifierNode('JsonValue');

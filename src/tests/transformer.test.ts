import { deepStrictEqual } from 'assert';
import { PostgresDialect } from '../dialects';
import {
  AliasDeclarationNode,
  ExportStatementNode,
  ExtendsClauseNode,
  GenericExpressionNode,
  IdentifierNode,
  ImportStatementNode,
  InferClauseNode,
  InterfaceDeclarationNode,
  ObjectExpressionNode,
  PropertyNode,
  UnionExpressionNode,
} from '../nodes';
import { Transformer } from '../transformer';
import { describe, it } from './test.utils';

void describe('transformer', () => {
  void it('should be able to transform to camelCase', () => {
    const dialect = new PostgresDialect();
    const transformer = new Transformer(dialect, true);

    const actualAst = transformer.transform([
      {
        columns: [
          {
            dataType: '',
            hasDefaultValue: true,
            isAutoIncrementing: false,
            isNullable: false,
            name: 'baz_qux',
          },
        ],
        name: 'foo_bar',
        schema: 'public',
      },
    ]);

    const expectedAst = [
      new ImportStatementNode('kysely', ['ColumnType']),
      new ExportStatementNode(
        new AliasDeclarationNode(
          'Generated',
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
      ),
      new ExportStatementNode(
        new InterfaceDeclarationNode(
          'FooBar',
          new ObjectExpressionNode([
            new PropertyNode(
              'bazQux',
              new GenericExpressionNode('Generated', [
                new IdentifierNode('string'),
              ]),
            ),
          ]),
        ),
      ),
      new ExportStatementNode(
        new InterfaceDeclarationNode(
          'DB',
          new ObjectExpressionNode([
            new PropertyNode('fooBar', new IdentifierNode('FooBar')),
          ]),
        ),
      ),
    ];

    deepStrictEqual(actualAst, expectedAst);
  });
});

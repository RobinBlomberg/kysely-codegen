import { deepStrictEqual } from 'assert';
import { EnumCollection } from '../collections';
import { GLOBAL_DEFINITIONS } from '../constants';
import { PostgresAdapter, PostgresDialect } from '../dialects';
import { ColumnMetadata, DatabaseMetadata, TableMetadata } from '../metadata';
import {
  AliasDeclarationNode,
  ArrayExpressionNode,
  ExportStatementNode,
  GenericExpressionNode,
  IdentifierNode,
  ImportClauseNode,
  ImportStatementNode,
  InterfaceDeclarationNode,
  LiteralNode,
  ObjectExpressionNode,
  PropertyNode,
  UnionExpressionNode,
} from '../nodes';
import { Transformer } from '../transformer';
import { describe, it } from './test.utils';

export const testTransformer = () => {
  void describe('transformer', () => {
    const enums = new EnumCollection({
      'public.mood': ['happy', 'ok', 'sad'],
      'public.mood_': ['', ',', "'", "'','"],
    });

    const transform = (tables: TableMetadata[], camelCase: boolean) => {
      const dialect = new PostgresDialect();
      const transformer = new Transformer();
      const metadata = new DatabaseMetadata(tables, enums);
      const nodes = transformer.transform({ camelCase, dialect, metadata });
      return nodes;
    };

    void it('should transform correctly', () => {
      const nodes = transform(
        [
          new TableMetadata({
            columns: [
              new ColumnMetadata({
                dataType: 'interval',
                hasDefaultValue: true,
                name: 'interval',
              }),
              new ColumnMetadata({
                dataType: 'mood',
                name: 'mood',
              }),
              new ColumnMetadata({
                dataType: 'text',
                isArray: true,
                name: 'array',
              }),
            ],
            name: 'table',
            schema: 'public',
          }),
        ],
        false,
      );

      deepStrictEqual(nodes, [
        new ImportStatementNode('kysely', [new ImportClauseNode('ColumnType')]),
        new ImportStatementNode('postgres-interval', [
          new ImportClauseNode('IPostgresInterval'),
        ]),
        new ExportStatementNode(
          new AliasDeclarationNode('Generated', GLOBAL_DEFINITIONS.Generated),
        ),
        new ExportStatementNode(
          new AliasDeclarationNode(
            'Interval',
            new PostgresAdapter().definitions.Interval,
          ),
        ),
        new ExportStatementNode(
          new AliasDeclarationNode(
            'Mood',
            new UnionExpressionNode([
              new LiteralNode('happy'),
              new LiteralNode('ok'),
              new LiteralNode('sad'),
            ]),
          ),
        ),
        new ExportStatementNode(
          new InterfaceDeclarationNode(
            'Table',
            new ObjectExpressionNode([
              new PropertyNode(
                'interval',
                new GenericExpressionNode('Generated', [
                  new IdentifierNode('Interval'),
                ]),
              ),
              new PropertyNode('mood', new IdentifierNode('Mood')),
              new PropertyNode(
                'array',
                new ArrayExpressionNode(new IdentifierNode('string')),
              ),
            ]),
          ),
        ),
        new ExportStatementNode(
          new InterfaceDeclarationNode(
            'DB',
            new ObjectExpressionNode([
              new PropertyNode('table', new IdentifierNode('Table')),
            ]),
          ),
        ),
      ]);
    });

    void it('should be able to transform to camelCase', () => {
      const nodes = transform(
        [
          new TableMetadata({
            columns: [
              new ColumnMetadata({
                dataType: '',
                hasDefaultValue: true,
                name: 'baz_qux',
              }),
            ],
            name: 'foo_bar',
            schema: 'public',
          }),
        ],
        true,
      );

      deepStrictEqual(nodes, [
        new ImportStatementNode('kysely', [new ImportClauseNode('ColumnType')]),
        new ExportStatementNode(
          new AliasDeclarationNode('Generated', GLOBAL_DEFINITIONS.Generated),
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
      ]);
    });

    void it('should transform Postgres enums correctly', () => {
      const nodes = transform(
        [
          new TableMetadata({
            columns: [
              new ColumnMetadata({
                dataType: 'mood',
                hasDefaultValue: false,
                name: 'column1',
              }),
              new ColumnMetadata({
                dataType: 'mood_',
                hasDefaultValue: true,
                name: 'column2',
              }),
            ],
            name: 'table',
            schema: 'public',
          }),
        ],
        false,
      );

      deepStrictEqual(nodes, [
        new ImportStatementNode('kysely', [new ImportClauseNode('ColumnType')]),
        new ExportStatementNode(
          new AliasDeclarationNode('Generated', GLOBAL_DEFINITIONS.Generated),
        ),
        new ExportStatementNode(
          new AliasDeclarationNode(
            'Mood',
            new UnionExpressionNode([
              new LiteralNode('happy'),
              new LiteralNode('ok'),
              new LiteralNode('sad'),
            ]),
          ),
        ),
        new ExportStatementNode(
          new AliasDeclarationNode(
            'Mood2',
            new UnionExpressionNode([
              new LiteralNode(''),
              new LiteralNode(','),
              new LiteralNode("'"),
              new LiteralNode("'','"),
            ]),
          ),
        ),
        new ExportStatementNode(
          new InterfaceDeclarationNode(
            'Table',
            new ObjectExpressionNode([
              new PropertyNode('column1', new IdentifierNode('Mood')),
              new PropertyNode(
                'column2',
                new GenericExpressionNode('Generated', [
                  new IdentifierNode('Mood2'),
                ]),
              ),
            ]),
          ),
        ),
        new ExportStatementNode(
          new InterfaceDeclarationNode(
            'DB',
            new ObjectExpressionNode([
              new PropertyNode('table', new IdentifierNode('Table')),
            ]),
          ),
        ),
      ]);
    });
  });
};

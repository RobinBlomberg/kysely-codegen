import { deepStrictEqual } from 'assert';
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
  RuntimeEnumDeclarationNode,
  UnionExpressionNode,
} from '../ast';
import {
  ColumnMetadata,
  DatabaseMetadata,
  EnumCollection,
  TableMetadata,
} from '../core';
import { PostgresAdapter, PostgresDialect } from '../dialects';
import { describe, it } from '../test.utils';
import { GLOBAL_DEFINITIONS } from './definitions';
import { Transformer } from './transformer';

export const testTransformer = () => {
  void describe('transformer', () => {
    const enums = new EnumCollection({
      'public.mood': ['happy', 'ok', 'sad'],
      'public.mood_': ['', ',', "'", "'','"],
    });

    const transform = (
      tables: TableMetadata[],
      camelCase: boolean,
      runtimeEnums: boolean,
    ) => {
      const dialect = new PostgresDialect();
      const transformer = new Transformer();
      const metadata = new DatabaseMetadata(tables, enums);
      return transformer.transform({
        camelCase,
        dialect,
        metadata,
        runtimeEnums,
      });
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
                dataType: 'interval',
                isArray: true,
                name: 'intervals',
              }),
              new ColumnMetadata({
                dataType: 'mood',
                name: 'mood',
              }),
              new ColumnMetadata({
                dataType: 'text',
                isArray: true,
                name: 'texts',
              }),
            ],
            name: 'table',
            schema: 'public',
          }),
        ],
        false,
        false,
      );

      deepStrictEqual(nodes, [
        new ImportStatementNode('kysely', [new ImportClauseNode('ColumnType')]),
        new ImportStatementNode('postgres-interval', [
          new ImportClauseNode('IPostgresInterval'),
        ]),
        new ExportStatementNode(
          new AliasDeclarationNode('ArrayType', GLOBAL_DEFINITIONS.ArrayType),
        ),
        new ExportStatementNode(
          new AliasDeclarationNode(
            'ArrayTypeImpl',
            GLOBAL_DEFINITIONS.ArrayTypeImpl,
          ),
        ),
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
              new PropertyNode(
                'intervals',
                new GenericExpressionNode('ArrayType', [
                  new IdentifierNode('Interval'),
                ]),
              ),
              new PropertyNode('mood', new IdentifierNode('Mood')),
              new PropertyNode(
                'texts',
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
        false,
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

    void it('should transform runtime enums correctly', () => {
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
        true,
      );

      deepStrictEqual(nodes, [
        new ImportStatementNode('kysely', [new ImportClauseNode('ColumnType')]),
        new ExportStatementNode(
          new RuntimeEnumDeclarationNode(
            'Mood',
            new UnionExpressionNode([
              new LiteralNode('happy'),
              new LiteralNode('ok'),
              new LiteralNode('sad'),
            ]),
          ),
        ),
        new ExportStatementNode(
          new RuntimeEnumDeclarationNode(
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
          new AliasDeclarationNode('Generated', GLOBAL_DEFINITIONS.Generated),
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

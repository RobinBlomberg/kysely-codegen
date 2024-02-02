import { deepStrictEqual } from 'assert';
import { describe, it } from 'vitest';
import type { TableSchema } from '../../introspector/index.js';
import { EnumMap, factory } from '../../introspector/index.js';
import { AliasDeclarationNode } from '../ast/alias-declaration-node.js';
import { ArrayExpressionNode } from '../ast/array-expression-node.js';
import { ExportStatementNode } from '../ast/export-statement-node.js';
import { GenericExpressionNode } from '../ast/generic-expression-node.js';
import { IdentifierNode } from '../ast/identifier-node.js';
import { ImportClauseNode } from '../ast/import-clause-node.js';
import { ImportStatementNode } from '../ast/import-statement-node.js';
import { InterfaceDeclarationNode } from '../ast/interface-declaration-node.js';
import { LiteralNode } from '../ast/literal-node.js';
import { ObjectExpressionNode } from '../ast/object-expression-node.js';
import { PropertyNode } from '../ast/property-node.js';
import { UnionExpressionNode } from '../ast/union-expression-node.js';
import {
  postgresAdapter,
  postgresDefinitions,
} from '../core/adapters/postgres.adapter.js';
import { GLOBAL_DEFINITIONS } from './definitions.js';
import { transform } from './transform.js';

describe('transform', () => {
  const postgresTransform = (tables: TableSchema[], camelCase: boolean) => {
    const schema = {
      enums: new EnumMap({
        'public.mood': ['happy', 'ok', 'sad'],
        'public.mood_': ['', ',', "'", "'','"],
      }),
      tables,
    };
    return transform({
      adapter: postgresAdapter,
      camelCase,
      schema,
    });
  };

  it('should transform correctly', () => {
    const nodes = postgresTransform(
      [
        factory.createTableSchema({
          columns: [
            factory.createColumnSchema({
              dataType: 'interval',
              hasDefaultValue: true,
              name: 'interval',
            }),
            factory.createColumnSchema({
              dataType: 'interval',
              isArray: true,
              name: 'intervals',
            }),
            factory.createColumnSchema({
              dataType: 'mood',
              name: 'mood',
            }),
            factory.createColumnSchema({
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
        new AliasDeclarationNode('Generated', GLOBAL_DEFINITIONS.Generated),
      ),
      new ExportStatementNode(
        new AliasDeclarationNode('Interval', postgresDefinitions.Interval),
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

  it('should be able to transform to camelCase', () => {
    const nodes = postgresTransform(
      [
        factory.createTableSchema({
          name: 'foo_bar',
          schema: 'public',
          columns: [
            factory.createColumnSchema({
              name: 'baz_qux',
              dataType: '',
              hasDefaultValue: true,
            }),
          ],
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

  it('should transform Postgres enums correctly', () => {
    const nodes = postgresTransform(
      [
        factory.createTableSchema({
          columns: [
            factory.createColumnSchema({
              dataType: 'mood',
              hasDefaultValue: false,
              name: 'column1',
            }),
            factory.createColumnSchema({
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

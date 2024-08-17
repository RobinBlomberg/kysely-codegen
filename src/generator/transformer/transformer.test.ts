import { deepStrictEqual } from 'assert';
import { describe, it } from 'vitest';
import { NumericParser } from '../../introspector/dialects/postgres/numeric-parser';
import { EnumCollection } from '../../introspector/enum-collection';
import { ColumnMetadata } from '../../introspector/metadata/column-metadata';
import { DatabaseMetadata } from '../../introspector/metadata/database-metadata';
import { TableMetadata } from '../../introspector/metadata/table-metadata';
import { AliasDeclarationNode } from '../ast/alias-declaration-node';
import { ArrayExpressionNode } from '../ast/array-expression-node';
import { ExportStatementNode } from '../ast/export-statement-node';
import { GenericExpressionNode } from '../ast/generic-expression-node';
import { IdentifierNode } from '../ast/identifier-node';
import { ImportClauseNode } from '../ast/import-clause-node';
import { ImportStatementNode } from '../ast/import-statement-node';
import { InterfaceDeclarationNode } from '../ast/interface-declaration-node';
import { JsonColumnTypeNode } from '../ast/json-column-type-node';
import { LiteralNode } from '../ast/literal-node';
import { ObjectExpressionNode } from '../ast/object-expression-node';
import { PropertyNode } from '../ast/property-node';
import { RawExpressionNode } from '../ast/raw-expression-node';
import { RuntimeEnumDeclarationNode } from '../ast/runtime-enum-declaration-node';
import { UnionExpressionNode } from '../ast/union-expression-node';
import { PostgresAdapter } from '../dialects/postgres/postgres-adapter';
import { PostgresDialect } from '../dialects/postgres/postgres-dialect';
import { GLOBAL_DEFINITIONS } from './definitions';
import { Transformer } from './transformer';

describe(Transformer.name, () => {
  const enums = new EnumCollection({
    'public.mood': ['happy', 'ok', 'sad'],
    'public.mood_': ['', ',', "'", "'','"],
  });

  const transform = ({
    camelCase,
    numericParser,
    runtimeEnums,
    tables,
  }: {
    camelCase?: boolean;
    numericParser?: NumericParser;
    runtimeEnums?: boolean;
    tables: TableMetadata[];
  }) => {
    const dialect = new PostgresDialect({ numericParser });
    const transformer = new Transformer();
    const metadata = new DatabaseMetadata(tables, enums);

    return transformer.transform({
      camelCase,
      dialect,
      metadata,
      overrides: {
        columns: {
          'table.expression_override': new GenericExpressionNode('Generated', [
            new IdentifierNode('boolean'),
          ]),
          'table.json_override': new JsonColumnTypeNode(
            new RawExpressionNode('{ foo: "bar" }'),
          ),
          'table.raw_override': '{ test: string }',
        },
      },
      runtimeEnums,
    });
  };

  it('should transform correctly', () => {
    const nodes = transform({
      tables: [
        new TableMetadata({
          columns: [
            new ColumnMetadata({
              dataType: 'boolean',
              name: 'expression_override',
            }),
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
              dataType: 'text',
              name: 'json_override',
            }),
            new ColumnMetadata({
              dataType: 'mood',
              name: 'mood',
            }),
            new ColumnMetadata({
              dataType: 'text',
              name: 'raw_override',
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
    });

    deepStrictEqual(nodes, [
      new ImportStatementNode('kysely', [
        new ImportClauseNode('ColumnType'),
        new ImportClauseNode('JSONColumnType'),
      ]),
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
              'expression_override',
              new GenericExpressionNode('Generated', [
                new IdentifierNode('boolean'),
              ]),
            ),
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
            new PropertyNode(
              'json_override',
              new JsonColumnTypeNode(new RawExpressionNode('{ foo: "bar" }')),
            ),
            new PropertyNode('mood', new IdentifierNode('Mood')),
            new PropertyNode(
              'raw_override',
              new RawExpressionNode('{ test: string }'),
            ),
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
    const nodes = transform({
      camelCase: true,
      tables: [
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
    });

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

  it('should be able to transform using an alternative Postgres numeric parser', () => {
    const nodes = transform({
      numericParser: NumericParser.NUMBER,
      tables: [
        new TableMetadata({
          columns: [
            new ColumnMetadata({
              dataType: 'numeric',
              name: 'numeric',
            }),
          ],
          name: 'table',
        }),
      ],
    });

    deepStrictEqual((nodes[1] as any).argument.body.args[0].name, 'number');
  });

  it('should transform Postgres enums correctly', () => {
    const nodes = transform({
      tables: [
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
    });

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

  it('should transform runtime enums correctly', () => {
    const nodes = transform({
      runtimeEnums: true,
      tables: [
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
    });

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

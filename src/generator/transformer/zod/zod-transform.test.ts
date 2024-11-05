import { deepStrictEqual } from 'assert';
import { describe, it } from 'vitest';
import type { DateParser } from '../../../introspector/dialects/postgres/date-parser';
import { EnumCollection } from '../../../introspector/enum-collection';
import { ColumnMetadata } from '../../../introspector/metadata/column-metadata';
import { DatabaseMetadata } from '../../../introspector/metadata/database-metadata';
import { TableMetadata } from '../../../introspector/metadata/table-metadata';
import { AliasDeclarationNode } from '../../ast/alias-declaration-node';
import { ArrayExpressionNode } from '../../ast/array-expression-node';
import { EnumExpressionNode } from '../../ast/enum-expression-node';
import { ExportStatementNode } from '../../ast/export-statement-node';
import { GenericExpressionNode } from '../../ast/generic-expression-node';
import { IdentifierNode } from '../../ast/identifier-node';
import { ImportClauseNode } from '../../ast/import-clause-node';
import { ImportStatementNode } from '../../ast/import-statement-node';
import { InterfaceDeclarationNode } from '../../ast/interface-declaration-node';
import { JsonColumnTypeNode } from '../../ast/json-column-type-node';
import { LiteralNode } from '../../ast/literal-node';
import { ObjectExpressionNode } from '../../ast/object-expression-node';
import { PropertyNode } from '../../ast/property-node';
import { RawExpressionNode } from '../../ast/raw-expression-node';
import { RuntimeEnumDeclarationNode } from '../../ast/runtime-enum-declaration-node';
import { PostgresZodAdapter } from '../../dialects/zod-dialects/postgres-zod/postgres-zod-adapter';
import { PostgresZodDialect } from '../../dialects/zod-dialects/postgres-zod/postgres-zod-dialect';
import { zodTransform } from './zod-transform';

describe(zodTransform.name, () => {
  const enums = new EnumCollection({
    'public.mood': ['happy', 'ok', 'sad'],
    'public.mood_': ['', ',', "'", "'','"],
  });

  const transformWithDefaults = ({
    camelCase,
    runtimeEnums,
    tables,
  }: {
    camelCase?: boolean;
    dateParser?: DateParser;
    runtimeEnums?: boolean;
    tables: TableMetadata[];
  }) => {
    return zodTransform({
      camelCase,
      dialect: new PostgresZodDialect(),
      metadata: new DatabaseMetadata({ enums, tables }),
      overrides: {
        columns: {
          'table.expression_override': new GenericExpressionNode('Generated', [
            new IdentifierNode('boolean'),
          ]),
          'table.json_override': new JsonColumnTypeNode(
            new RawExpressionNode('{ foo: "bar" }'),
          ),
          'table.raw_override': '{ test: z.string() }',
        },
      },
      runtimeEnums,
    });
  };

  it('should transform correctly', () => {
    const nodes = transformWithDefaults({
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
        new TableMetadata({
          columns: [
            new ColumnMetadata({
              dataType: 'integer',
              name: 'id',
            }),
          ],
          name: 'other_table',
          schema: 'not_public',
        }),
      ],
    });

    deepStrictEqual(nodes, [
      new ImportStatementNode('zod', [new ImportClauseNode('z')]),
      new ExportStatementNode(
        new AliasDeclarationNode(
          'intervalSchema',
          new PostgresZodAdapter().definitions.intervalSchema,
        ),
      ),
      new ExportStatementNode(
        new AliasDeclarationNode(
          'moodSchema',
          new EnumExpressionNode([
            new LiteralNode('happy'),
            new LiteralNode('ok'),
            new LiteralNode('sad'),
          ]),
        ),
      ),
      new ExportStatementNode(
        new InterfaceDeclarationNode(
          'notPublicOtherTableTableSchema',
          new ObjectExpressionNode([
            new PropertyNode('id', new IdentifierNode('z.string()')),
          ]),
        ),
      ),
      new ExportStatementNode(
        new InterfaceDeclarationNode(
          'tableTableSchema',
          new ObjectExpressionNode([
            new PropertyNode(
              'expression_override',
              new GenericExpressionNode('Generated', [
                new IdentifierNode('boolean'),
              ]),
            ),
            new PropertyNode('interval', new IdentifierNode('intervalSchema')),
            new PropertyNode(
              'intervals',
              new ArrayExpressionNode(new IdentifierNode('intervalSchema')),
            ),
            new PropertyNode(
              'json_override',
              new JsonColumnTypeNode(new RawExpressionNode('{ foo: "bar" }')),
            ),
            new PropertyNode('mood', new IdentifierNode('moodSchema')),
            new PropertyNode(
              'raw_override',
              new RawExpressionNode('{ test: z.string() }'),
            ),
            new PropertyNode(
              'texts',
              new ArrayExpressionNode(new IdentifierNode('z.string()')),
            ),
          ]),
        ),
      ),
      new ExportStatementNode(
        new InterfaceDeclarationNode(
          'DBSchema',
          new ObjectExpressionNode([
            new PropertyNode(
              'not_public.other_table',
              new IdentifierNode('notPublicOtherTableTableSchema'),
            ),
            new PropertyNode('table', new IdentifierNode('tableTableSchema')),
          ]),
        ),
      ),
    ]);
  });

  it('should transform Postgres enums correctly', () => {
    const nodes = transformWithDefaults({
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
      new ImportStatementNode('zod', [new ImportClauseNode('z')]),
      new ExportStatementNode(
        new AliasDeclarationNode(
          'moodSchema',
          new EnumExpressionNode([
            new LiteralNode('happy'),
            new LiteralNode('ok'),
            new LiteralNode('sad'),
          ]),
        ),
      ),
      new ExportStatementNode(
        new AliasDeclarationNode(
          'moodSchema2',
          new EnumExpressionNode([
            new LiteralNode(''),
            new LiteralNode(','),
            new LiteralNode("'"),
            new LiteralNode("'','"),
          ]),
        ),
      ),
      new ExportStatementNode(
        new InterfaceDeclarationNode(
          'tableTableSchema',
          new ObjectExpressionNode([
            new PropertyNode('column1', new IdentifierNode('moodSchema')),
            new PropertyNode('column2', new IdentifierNode('moodSchema2')),
          ]),
        ),
      ),
      new ExportStatementNode(
        new InterfaceDeclarationNode(
          'DBSchema',
          new ObjectExpressionNode([
            new PropertyNode('table', new IdentifierNode('tableTableSchema')),
          ]),
        ),
      ),
    ]);
  });

  it('should transform Postgres runtime enums correctly', () => {
    const nodes = transformWithDefaults({
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
      new ImportStatementNode('zod', [new ImportClauseNode('z')]),
      new ExportStatementNode(
        new RuntimeEnumDeclarationNode('moodSchema', ['happy', 'ok', 'sad']),
      ),
      new ExportStatementNode(
        new RuntimeEnumDeclarationNode('moodSchema2', ['', ',', "'", "'','"]),
      ),
      new ExportStatementNode(
        new InterfaceDeclarationNode(
          'tableTableSchema',
          new ObjectExpressionNode([
            new PropertyNode('column1', new IdentifierNode('moodSchema')),
            new PropertyNode('column2', new IdentifierNode('moodSchema2')),
          ]),
        ),
      ),
      new ExportStatementNode(
        new InterfaceDeclarationNode(
          'DBSchema',
          new ObjectExpressionNode([
            new PropertyNode('table', new IdentifierNode('tableTableSchema')),
          ]),
        ),
      ),
    ]);
  });
});

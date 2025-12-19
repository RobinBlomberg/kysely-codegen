import { deepStrictEqual } from 'node:assert';
import type { DateParser } from '../../introspector/dialects/postgres/date-parser';
import type { NumericParser } from '../../introspector/dialects/postgres/numeric-parser';
import { EnumCollection } from '../../introspector/enum-collection';
import { ColumnMetadata } from '../../introspector/metadata/column-metadata';
import { DatabaseMetadata } from '../../introspector/metadata/database-metadata';
import { TableMetadata } from '../../introspector/metadata/table-metadata';
import { AliasDeclarationNode } from '../ast/alias-declaration-node';
import { ArrayExpressionNode } from '../ast/array-expression-node';
import { ExportStatementNode } from '../ast/export-statement-node';
import { GenericExpressionNode } from '../ast/generic-expression-node';
import { IdentifierNode, TableIdentifierNode } from '../ast/identifier-node';
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
import type { RuntimeEnumsStyle } from '../generator/runtime-enums-style';
import { GLOBAL_DEFINITIONS } from './definitions';
import { transform } from './transformer';
import { describe, it } from 'vitest';

describe(transform.name, () => {
  const enums = new EnumCollection({
    'public.mood': ['happy', 'ok', 'sad'],
    'public.mood_': ['', ',', "'", "'','"],
  });

  const transformWithDefaults = ({
    camelCase,
    dateParser,
    numericParser,
    runtimeEnums,
    tables,
  }: {
    camelCase?: boolean;
    dateParser?: DateParser;
    numericParser?: NumericParser;
    runtimeEnums?: boolean | RuntimeEnumsStyle;
    tables: TableMetadata[];
  }) => {
    return transform({
      camelCase,
      dialect: new PostgresDialect({ dateParser, numericParser }),
      metadata: new DatabaseMetadata({ enums, tables }),
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
          new TableIdentifierNode('NotPublicOtherTable'),
          new ObjectExpressionNode([
            new PropertyNode('id', new IdentifierNode('string')),
          ]),
        ),
      ),
      new ExportStatementNode(
        new InterfaceDeclarationNode(
          new TableIdentifierNode('Table'),
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
          new IdentifierNode('DB'),
          new ObjectExpressionNode([
            new PropertyNode(
              'not_public.other_table',
              new TableIdentifierNode('NotPublicOtherTable'),
            ),
            new PropertyNode('table', new TableIdentifierNode('Table')),
          ]),
        ),
      ),
    ]);
  });

  it('should be able to transform to camelCase', () => {
    const nodes = transformWithDefaults({
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
          new TableIdentifierNode('FooBar'),
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
          new IdentifierNode('DB'),
          new ObjectExpressionNode([
            new PropertyNode('fooBar', new TableIdentifierNode('FooBar')),
          ]),
        ),
      ),
    ]);
  });

  it('should be able to transform using an alternative Postgres date parser', () => {
    const nodes = transformWithDefaults({
      dateParser: 'string',
      tables: [
        new TableMetadata({
          columns: [
            new ColumnMetadata({
              dataType: 'date',
              name: 'date',
            }),
          ],
          name: 'table',
        }),
      ],
    });

    deepStrictEqual(nodes, [
      new ExportStatementNode(
        new InterfaceDeclarationNode(
          new TableIdentifierNode('Table'),
          new ObjectExpressionNode([
            new PropertyNode('date', new IdentifierNode('string')),
          ]),
        ),
      ),
      new ExportStatementNode(
        new InterfaceDeclarationNode(
          new IdentifierNode('DB'),
          new ObjectExpressionNode([
            new PropertyNode('table', new TableIdentifierNode('Table')),
          ]),
        ),
      ),
    ]);
  });

  it('should be able to transform using an alternative Postgres numeric parser', () => {
    const nodes = transformWithDefaults({
      numericParser: 'number',
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
          new TableIdentifierNode('Table'),
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
          new IdentifierNode('DB'),
          new ObjectExpressionNode([
            new PropertyNode('table', new TableIdentifierNode('Table')),
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
      new ImportStatementNode('kysely', [new ImportClauseNode('ColumnType')]),
      new ExportStatementNode(
        new RuntimeEnumDeclarationNode('Mood', ['happy', 'ok', 'sad']),
      ),
      new ExportStatementNode(
        new RuntimeEnumDeclarationNode('Mood2', ['', ',', "'", "'','"]),
      ),
      new ExportStatementNode(
        new AliasDeclarationNode('Generated', GLOBAL_DEFINITIONS.Generated),
      ),
      new ExportStatementNode(
        new InterfaceDeclarationNode(
          new TableIdentifierNode('Table'),
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
          new IdentifierNode('DB'),
          new ObjectExpressionNode([
            new PropertyNode('table', new TableIdentifierNode('Table')),
          ]),
        ),
      ),
    ]);
  });

  it('should transform with custom imports correctly', () => {
    const nodes = transform({
      customImports: {
        InstantRange: './custom-types',
        MyCustomType: '@my-org/custom-types',
      },
      dialect: new PostgresDialect({}),
      metadata: new DatabaseMetadata({
        enums,
        tables: [
          new TableMetadata({
            columns: [
              new ColumnMetadata({
                dataType: 'text',
                name: 'custom_column',
              }),
            ],
            name: 'table',
            schema: 'public',
          }),
        ],
      }),
      overrides: {
        columns: {
          'table.custom_column': new GenericExpressionNode('ColumnType', [
            new IdentifierNode('InstantRange'),
            new IdentifierNode('InstantRange'),
            new IdentifierNode('never'),
          ]),
        },
      },
    });

    // Verify custom imports are included:
    const importNodes = nodes.filter((node) => node.type === 'ImportStatement');
    const customImport = importNodes.find(
      (node) => node.moduleName === './custom-types',
    );
    deepStrictEqual(
      customImport,
      new ImportStatementNode('./custom-types', [
        new ImportClauseNode('InstantRange'),
      ]),
    );
  });

  it('should support named imports with # syntax', () => {
    const nodes = transform({
      customImports: {
        InstantRange: './custom-types#CustomInstantRange',
        MyType: '@my-org/types#OriginalType',
        SameNameImport: './same-types#SameNameImport',
      },
      dialect: new PostgresDialect({}),
      metadata: new DatabaseMetadata({
        enums,
        tables: [
          new TableMetadata({
            columns: [
              new ColumnMetadata({
                dataType: 'text',
                name: 'date_range',
              }),
              new ColumnMetadata({
                dataType: 'text',
                name: 'metadata',
              }),
              new ColumnMetadata({
                dataType: 'text',
                name: 'same_data',
              }),
            ],
            name: 'events',
            schema: 'public',
          }),
        ],
      }),
      overrides: {
        columns: {
          'events.date_range': new GenericExpressionNode('ColumnType', [
            new IdentifierNode('InstantRange'),
            new IdentifierNode('InstantRange'),
            new IdentifierNode('never'),
          ]),
          'events.metadata': new IdentifierNode('MyType'),
          'events.same_data': new IdentifierNode('SameNameImport'),
        },
      },
    });

    // Verify custom imports with named exports are generated correctly:
    const importNodes = nodes.filter((node) => node.type === 'ImportStatement');

    // Check aliased import: `import { CustomInstantRange as InstantRange } from './custom-types';`
    const customImport = importNodes.find(
      (node) => node.moduleName === './custom-types',
    );
    deepStrictEqual(
      customImport,
      new ImportStatementNode('./custom-types', [
        new ImportClauseNode('CustomInstantRange', 'InstantRange'),
      ]),
    );

    // Check aliased import: `import { OriginalType as MyType } from '@my-org/types';`
    const orgImport = importNodes.find(
      (node) => node.moduleName === '@my-org/types',
    );
    deepStrictEqual(
      orgImport,
      new ImportStatementNode('@my-org/types', [
        new ImportClauseNode('OriginalType', 'MyType'),
      ]),
    );

    // Check non-aliased named import: `import { SameNameImport } from './same-types';`
    const sameImport = importNodes.find(
      (node) => node.moduleName === './same-types',
    );
    deepStrictEqual(
      sameImport,
      new ImportStatementNode('./same-types', [
        new ImportClauseNode('SameNameImport', null),
      ]),
    );
  });

  it('should collect custom imports from raw override expressions', () => {
    const nodes = transform({
      customImports: {
        CustomType: './types',
        JSONColumnType: 'kysely',
        OtherType: './types',
        TemplateType: './types',
      },
      dialect: new PostgresDialect({}),
      metadata: new DatabaseMetadata({
        enums,
        tables: [
          new TableMetadata({
            columns: [
              new ColumnMetadata({
                dataType: 'text',
                name: 'payload',
              }),
            ],
            name: 'table',
            schema: 'public',
          }),
        ],
      }),
      overrides: {
        columns: {
          'table.payload':
            'JSONColumnType<Record<string, CustomType | OtherType[]> | `prefix-${TemplateType}`>',
        },
      },
    });

    const importNodes = nodes.filter((node) => node.type === 'ImportStatement');
    const typesImport = importNodes.find(
      (node) => node.moduleName === './types',
    );

    deepStrictEqual(
      typesImport?.imports.map((clause) => clause.name).sort(),
      ['CustomType', 'OtherType', 'TemplateType'].sort(),
    );

    const kyselyImport = importNodes.find(
      (node) => node.moduleName === 'kysely',
    );
    deepStrictEqual(
      kyselyImport,
      new ImportStatementNode('kysely', [
        new ImportClauseNode('JSONColumnType'),
      ]),
    );
  });

  it('should ignore property and parameter names in raw overrides', () => {
    const nodes = transform({
      customImports: {
        CustomType: './types',
        OtherType: './types',
        bar: './types',
        baz: './types',
        foo: './types',
      },
      dialect: new PostgresDialect({}),
      metadata: new DatabaseMetadata({
        enums,
        tables: [
          new TableMetadata({
            columns: [
              new ColumnMetadata({
                dataType: 'text',
                name: 'details',
              }),
            ],
            name: 'table',
            schema: 'public',
          }),
        ],
      }),
      overrides: {
        columns: {
          'table.details':
            '({ foo: CustomType; readonly bar?: OtherType } & ((baz: CustomType) => OtherType))',
        },
      },
    });

    const importNodes = nodes.filter((node) => node.type === 'ImportStatement');
    const typesImport = importNodes.find(
      (node) => node.moduleName === './types',
    );

    deepStrictEqual(
      typesImport?.imports.map((clause) => clause.name).sort(),
      ['CustomType', 'OtherType'].sort(),
    );
  });

  it('should ignore identifiers inside strings and comments in raw overrides', () => {
    const nodes = transform({
      customImports: {
        CommentType: './types',
        CustomType: './types',
      },
      dialect: new PostgresDialect({}),
      metadata: new DatabaseMetadata({
        enums,
        tables: [
          new TableMetadata({
            columns: [
              new ColumnMetadata({
                dataType: 'text',
                name: 'notes',
              }),
            ],
            name: 'table',
            schema: 'public',
          }),
        ],
      }),
      overrides: {
        columns: {
          'table.notes':
            'CustomType | "CommentType" | /* CommentType */ null',
        },
      },
    });

    const importNodes = nodes.filter((node) => node.type === 'ImportStatement');
    const typesImport = importNodes.find(
      (node) => node.moduleName === './types',
    );

    deepStrictEqual(
      typesImport?.imports.map((clause) => clause.name).sort(),
      ['CustomType'].sort(),
    );
  });
});

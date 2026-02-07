import { sql } from 'kysely';
import { strictEqual } from 'node:assert';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { dedent } from 'ts-dedent';
import type {
  DatabaseMetadataOptions,
  IntrospectOptions,
} from '../../introspector';
import { DatabaseMetadata, PostgresIntrospector } from '../../introspector';
import {
  addExtraColumn,
  migrate,
} from '../../introspector/introspector.fixtures';
import { ArrayExpressionNode } from '../ast/array-expression-node';
import { GenericExpressionNode } from '../ast/generic-expression-node';
import { IdentifierNode, TableIdentifierNode } from '../ast/identifier-node';
import { JsonColumnTypeNode } from '../ast/json-column-type-node';
import { RawExpressionNode } from '../ast/raw-expression-node';
import type { GeneratorDialect } from '../dialect';
import { LibsqlDialect } from '../dialects/libsql/libsql-dialect';
import { MysqlDialect } from '../dialects/mysql/mysql-dialect';
import type { PostgresDialectOptions } from '../dialects/postgres/postgres-dialect';
import { PostgresDialect } from '../dialects/postgres/postgres-dialect';
import { SqliteDialect } from '../dialects/sqlite/sqlite-dialect';
import { Logger } from '../logger/logger';
import { toKyselyCamelCase } from '../utils/case-converter';
import type { GenerateOptions, SerializeFromMetadataOptions } from './generate';
import { generate, serializeFromMetadata } from './generate';

type Test = {
  connectionString: string;
  dialect: GeneratorDialect;
  generateOptions?: Omit<GenerateOptions, 'db' | 'dialect'>;
  name: string;
};

const SNAPSHOTS_DIR = join(__dirname, 'snapshots');

const TESTS: Test[] = [
  {
    connectionString: 'libsql://localhost:8080?tls=0',
    dialect: new LibsqlDialect(),
    name: 'libsql',
  },
  {
    connectionString: 'mysql://user:password@localhost/database',
    dialect: new MysqlDialect(),
    name: 'mysql',
  },
  {
    connectionString: 'postgres://user:password@localhost:5433/database',
    dialect: new PostgresDialect(),
    name: 'postgres',
  },
  {
    connectionString: 'postgres://user:password@localhost:5433/database',
    dialect: new PostgresDialect({
      dateParser: 'string',
      numericParser: 'number-or-string',
    }),
    generateOptions: { runtimeEnums: 'screaming-snake-case' },
    name: 'postgres2',
  },
  {
    connectionString: ':memory:',
    dialect: new SqliteDialect(),
    name: 'sqlite',
  },
];

describe(generate.name, () => {
  const baseGenerateOptions: Omit<GenerateOptions, 'db' | 'dialect'> = {
    camelCase: true,
    overrides: {
      columns: {
        'foo_bar.json_typed': new JsonColumnTypeNode(
          new RawExpressionNode('{ foo: "bar" }'),
        ),
        'foo_bar.overridden': new RawExpressionNode('"OVERRIDDEN"'),
      },
    },
  };

  it('should be able to use a custom introspector', async () => {
    class PostgresEnumTablesIntrospector extends PostgresIntrospector {
      override async introspect(options: IntrospectOptions<any>) {
        const metadata = await super.introspect(options);

        await sql`
          drop function if exists get_enum_tables_with_values();
        `.execute(options.db);

        await sql`
          create function get_enum_tables_with_values()
          returns table (schema_name text, table_name text, primary_key_column_name text, "values" text[]) as $$
          declare
            record record;
            query text;
          begin
            for record in
              select n.nspname as schema_name, c.relname as table_name, a.attname as primary_key_column_name
              from pg_class c
              join pg_namespace n on n.oid = c.relnamespace
              join pg_description d on d.objoid = c.oid
              join pg_index i on i.indrelid = c.oid
              join pg_attribute a on a.attrelid = c.oid and a.attnum = any(i.indkey)
              join pg_constraint con on con.conrelid = c.oid and con.contype = 'p' and con.conindid = i.indexrelid
              where c.relkind = 'r'
              and d.description = '@enum'
            loop
              query := format(
                'select %L as schema_name, %L as table_name, %L as primary_key_column_name, array_agg(name) as values from %I.%I',
                record.schema_name,
                record.table_name,
                record.primary_key_column_name,
                record.schema_name,
                record.table_name
              );
              return query execute query;
            end loop;
          end $$ language plpgsql;
        `.execute(options.db);

        const { rows: enumTableRows } = await sql<{
          primaryKeyColumnName: string;
          schemaName: string;
          tableName: string;
          values: string[];
        }>`
          select * from get_enum_tables_with_values();
        `.execute(options.db);

        for (const {
          primaryKeyColumnName,
          schemaName,
          tableName,
          values,
        } of enumTableRows) {
          metadata.enums.set(`${schemaName}.${tableName}`, values);

          const { rows: referencingColumnRows } = await sql<{
            columnName: string;
            tableName: string;
            tableSchema: string;
          }>`
            select tc.table_schema, tc.table_name, kcu.column_name
            from information_schema.table_constraints as tc
            join information_schema.key_column_usage as kcu
              on tc.constraint_name = kcu.constraint_name
              and tc.table_schema = kcu.table_schema
            join information_schema.constraint_column_usage as ccu
              on tc.constraint_name = ccu.constraint_name
              and tc.table_schema = ccu.table_schema
            where tc.constraint_type = 'FOREIGN KEY'
              and ccu.table_schema = ${schemaName}
              and ccu.table_name = ${tableName}
              and ccu.column_name = ${primaryKeyColumnName}
          `.execute(options.db);

          for (const row of referencingColumnRows) {
            for (const table of metadata.tables) {
              if (
                table.schema !== row.tableSchema ||
                table.name !== row.tableName
              ) {
                continue;
              }

              for (const column of table.columns) {
                if (column.name !== row.columnName) {
                  continue;
                }

                column.dataType = tableName;
                column.dataTypeSchema = schemaName;
              }
            }
          }

          metadata.tables = metadata.tables.filter((table) => {
            return table.schema !== schemaName || table.name !== tableName;
          });
        }

        return metadata;
      }
    }

    class PostgresEnumTablesDialect extends PostgresDialect {
      introspector: PostgresEnumTablesIntrospector;

      constructor(options?: PostgresDialectOptions) {
        super(options);

        this.introspector = new PostgresEnumTablesIntrospector({
          defaultSchemas: options?.defaultSchemas,
          domains: options?.domains,
          partitions: options?.partitions,
        });
      }
    }

    const dialect = new PostgresEnumTablesDialect();
    const db = await migrate(
      dialect,
      'postgres://user:password@localhost:5433/database',
    );
    const output = await generate({ db, dialect, outFile: null });
    expect(output).toContain('export type Enum = "bar" | "foo";\n');
    expect(output).toContain('  enum: Enum;\n  /**');
  });

  it('should generate the correct output for each dialect', async () => {
    for (const { connectionString, dialect, generateOptions, name } of TESTS) {
      const db = await migrate(dialect, connectionString);
      const output = await generate({
        ...baseGenerateOptions,
        ...generateOptions,
        db,
        dialect,
      });
      const expectedOutput = await readFile(
        join(SNAPSHOTS_DIR, `${name}.snapshot.ts`),
        'utf8',
      );
      strictEqual(output, expectedOutput);
      await db.destroy();
    }
  });

  it('should verify generated types for each dialect', async () => {
    for (const { connectionString, dialect, generateOptions, name } of TESTS) {
      const db = await migrate(dialect, connectionString);
      const outFile = join(SNAPSHOTS_DIR, `${name}.snapshot.ts`);
      await generate({
        ...baseGenerateOptions,
        ...generateOptions,
        db,
        dialect,
      });
      await addExtraColumn(db);

      try {
        await generate({
          ...baseGenerateOptions,
          ...generateOptions,
          db,
          dialect,
          outFile,
          verify: true,
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          strictEqual(
            error.message,
            "Generated types are not up-to-date! Use '--log-level=error' option to view the diff.",
          );
        } else {
          throw error;
        }
      }

      await db.destroy();
    }
  });

  afterAll(async () => {
    const db = await migrate(
      new PostgresDialect(),
      'postgres://user:password@localhost:5433/database',
    );

    await sql`drop schema if exists public cascade;`.execute(db);
    await sql`create schema public;`.execute(db);

    await db.destroy();
  });
});

describe(serializeFromMetadata.name, () => {
  const serialize = (
    options: Omit<SerializeFromMetadataOptions, 'dialect' | 'metadata'> & {
      dialect?: GeneratorDialect;
      metadata: DatabaseMetadataOptions;
    },
  ) => {
    return serializeFromMetadata({
      ...options,
      dialect: options.dialect ?? new PostgresDialect(),
      metadata: new DatabaseMetadata(options.metadata),
      skipAutogeneratedFileComment: true,
    }).trimEnd();
  };

  test('camelCase', () => {
    expect(
      serialize({
        camelCase: true,
        metadata: {
          tables: [
            {
              columns: [{ dataType: 'int4', name: 'baz_qux' }],
              name: 'foo_bar',
            },
          ],
        },
      }),
    ).toStrictEqual(
      dedent`
        export interface FooBar {
          bazQux: number;
        }

        export interface DB {
          fooBar: FooBar;
        }
      `,
    );
  });

  test('defaultSchemas', () => {
    expect(
      serialize({
        defaultSchemas: ['hidden', 'private'],
        metadata: {
          tables: [
            {
              columns: [{ dataType: 'int4', name: 'id' }],
              name: 'posts',
              schema: 'hidden',
            },
            {
              columns: [{ dataType: 'int4', name: 'id' }],
              name: 'users',
              schema: 'public',
            },
            {
              columns: [{ dataType: 'int4', name: 'id' }],
              name: 'comments',
              schema: 'private',
            },
          ],
        },
      }),
    ).toStrictEqual(
      dedent`
        export interface Comments {
          id: number;
        }

        export interface Posts {
          id: number;
        }

        export interface PublicUsers {
          id: number;
        }

        export interface DB {
          comments: Comments;
          posts: Posts;
          "public.users": PublicUsers;
        }
      `,
    );
  });

  describe('dialect', () => {
    test('PostgresDialect options', () => {
      expect(
        serialize({
          dialect: new PostgresDialect({
            dateParser: 'string',
            numericParser: 'number',
          }),
          metadata: {
            tables: [
              {
                columns: [
                  { dataType: 'date', name: 'date' },
                  { dataType: 'numeric', name: 'numeric' },
                ],
                name: 'table',
              },
            ],
          },
        }),
      ).toStrictEqual(
        dedent`
          import type { ColumnType } from "kysely";

          export type Numeric = ColumnType<number, number | string, number | string>;

          export interface Table {
            date: string;
            numeric: Numeric;
          }

          export interface DB {
            table: Table;
          }
        `,
      );
    });
  });

  test('logger', () => {
    class ArrayLogger extends Logger {
      readonly messages: string[] = [];

      debug(message = '') {
        this.messages.push(message);
      }
    }

    const logger = new ArrayLogger();

    serialize({
      logger,
      metadata: { tables: [{ columns: [], name: 'table' }] },
    });

    expect(logger.messages).toStrictEqual([
      '',
      'Found 1 public table:',
      ' - table',
      '',
    ]);
  });

  test('overrides', () => {
    expect(
      serialize({
        metadata: {
          tables: [
            {
              columns: [{ dataType: 'jsonb', name: 'author' }],
              name: 'posts',
              schema: 'hidden',
            },
            {
              columns: [
                { dataType: 'json', isArray: true, name: 'posts' },
                { dataType: 'json', name: 'settings' },
              ],
              name: 'users',
              schema: 'public',
            },
          ],
        },
        overrides: {
          columns: {
            'hidden.posts.author': new TableIdentifierNode('User'),
            'public.users.settings': '{ theme: "dark" }',
            'users.posts': new ArrayExpressionNode(
              new TableIdentifierNode('Post'),
            ),
          },
        },
      }),
    ).toStrictEqual(
      dedent`
        export interface HiddenPosts {
          author: User;
        }

        export interface Users {
          posts: Post[];
          settings: { theme: "dark" };
        }

        export interface DB {
          "hidden.posts": HiddenPosts;
          users: Users;
        }
      `,
    );
  });

  test('serializer', () => {
    expect(
      serialize({
        metadata: {
          tables: [
            {
              columns: [{ dataType: 'int4', name: 'baz_qux' }],
              name: 'users',
              schema: 'public',
            },
          ],
        },
        serializer: {
          serializeFile: (metadata) => {
            let output = 'import { z } from "zod";\n\n';

            for (const table of metadata.tables) {
              output += 'export const ';
              output += toKyselyCamelCase(table.name);
              output += 'Schema = z.object({\n';

              for (const column of table.columns) {
                output += '  ';
                output += column.name;
                output += ': ';

                switch (column.dataType) {
                  case 'int4':
                    output += 'z.number().int()';
                    break;
                  default:
                    output += 'z.unknown()';
                }

                output += ',\n';
              }

              output += '});\n\n';
            }

            return output;
          },
        },
      }),
    ).toStrictEqual(
      dedent`
        import { z } from "zod";

        export const usersSchema = z.object({
          baz_qux: z.number().int(),
        });
      `,
    );
  });

  test('singularize', () => {
    expect(
      serialize({
        metadata: {
          tables: [{ columns: [], name: 'users', schema: 'public' }],
        },
        singularize: { '/^(.*?)s?$/': '$1_model' },
      }),
    ).toStrictEqual(
      dedent`
        export interface UserModel {}

        export interface DB {
          users: UserModel;
        }
      `,
    );
  });

  test('customImports', () => {
    expect(
      serialize({
        customImports: {
          InstantRange: './custom-types',
          MyCustomType: '@my-org/custom-types',
        },
        metadata: {
          tables: [
            {
              columns: [
                { dataType: 'text', name: 'date_range' },
                { dataType: 'json', name: 'metadata' },
              ],
              name: 'events',
              schema: 'public',
            },
          ],
        },
        overrides: {
          columns: {
            'events.date_range': new GenericExpressionNode('ColumnType', [
              new IdentifierNode('InstantRange'),
              new IdentifierNode('InstantRange'),
              new IdentifierNode('never'),
            ]),
            'events.metadata': new IdentifierNode('MyCustomType'),
          },
        },
      }),
    ).toStrictEqual(
      dedent`
        import type { InstantRange } from "./custom-types";
        import type { MyCustomType } from "@my-org/custom-types";
        import type { ColumnType } from "kysely";

        export interface Events {
          date_range: ColumnType<InstantRange, InstantRange, never>;
          metadata: MyCustomType;
        }

        export interface DB {
          events: Events;
        }
      `,
    );
  });

  test('customImports with # syntax for named exports', () => {
    expect(
      serialize({
        customImports: {
          InstantRange: './custom-types#CustomInstantRange',
          MyType: '@org/types#OriginalType',
          SameNameImport: './utils#SameNameImport',
        },
        metadata: {
          tables: [
            {
              columns: [
                { dataType: 'text', name: 'date_range' },
                { dataType: 'text', name: 'user_type' },
                { dataType: 'text', name: 'data' },
              ],
              name: 'events',
              schema: 'public',
            },
          ],
        },
        overrides: {
          columns: {
            'events.date_range': new GenericExpressionNode('ColumnType', [
              new IdentifierNode('InstantRange'),
              new IdentifierNode('InstantRange'),
              new IdentifierNode('never'),
            ]),
            'events.user_type': new IdentifierNode('MyType'),
            'events.data': new IdentifierNode('SameNameImport'),
          },
        },
      }),
    ).toStrictEqual(
      dedent`
        import type { CustomInstantRange as InstantRange } from "./custom-types";
        import type { SameNameImport } from "./utils";
        import type { OriginalType as MyType } from "@org/types";
        import type { ColumnType } from "kysely";

        export interface Events {
          data: SameNameImport;
          date_range: ColumnType<InstantRange, InstantRange, never>;
          user_type: MyType;
        }

        export interface DB {
          events: Events;
        }
      `,
    );
  });

  test('customImports with generic types in string overrides', () => {
    expect(
      serialize({
        customImports: {
          CustomType: './types',
          JSONColumnType: 'kysely',
        },
        metadata: {
          tables: [
            {
              columns: [
                { dataType: 'text', name: 'id' },
                { dataType: 'json', name: 'jsonField' },
              ],
              name: 'table',
              schema: 'public',
            },
          ],
        },
        overrides: {
          columns: {
            'table.id': 'ColumnType<string, string, never>',
            'table.jsonField': 'JSONColumnType<CustomType>',
          },
        },
      }),
    ).toStrictEqual(
      dedent`
        import type { CustomType } from "./types";
        import type { ColumnType, JSONColumnType } from "kysely";

        export interface Table {
          id: ColumnType<string, string, never>;
          jsonField: JSONColumnType<CustomType>;
        }

        export interface DB {
          table: Table;
        }
      `,
    );
  });

  test('customImports with underscored type names in string overrides', () => {
    // Test that types with underscores are correctly extracted
    expect(
      serialize({
        customImports: {
          MY_CUSTOM_TYPE: './types',
          Type_With_Underscores: './types',
        },
        metadata: {
          tables: [
            {
              columns: [
                { dataType: 'text', name: 'field1' },
                { dataType: 'text', name: 'field2' },
              ],
              name: 'table',
              schema: 'public',
            },
          ],
        },
        overrides: {
          columns: {
            'table.field1': 'MY_CUSTOM_TYPE',
            'table.field2': 'Type_With_Underscores | null',
          },
        },
      }),
    ).toStrictEqual(
      dedent`
        import type { MY_CUSTOM_TYPE, Type_With_Underscores } from "./types";

        export interface Table {
          field1: MY_CUSTOM_TYPE;
          field2: Type_With_Underscores | null;
        }

        export interface DB {
          table: Table;
        }
      `,
    );
  });

  test('customImports with built-in types should be imported when specified', () => {
    // Test that built-in types are imported when explicitly specified in customImports
    expect(
      serialize({
        customImports: {
          Array: './custom-array',
          Map: './custom-map',
          CustomType: './types',
        },
        metadata: {
          tables: [
            {
              columns: [
                { dataType: 'text', name: 'field1' },
                { dataType: 'text', name: 'field2' },
              ],
              name: 'table',
              schema: 'public',
            },
          ],
        },
        overrides: {
          columns: {
            'table.field1': 'Array<CustomType>',
            'table.field2': 'Map<string, CustomType>',
          },
        },
      }),
    ).toStrictEqual(
      dedent`
        import type { Array } from "./custom-array";
        import type { Map } from "./custom-map";
        import type { CustomType } from "./types";

        export interface Table {
          field1: Array<CustomType>;
          field2: Map<string, CustomType>;
        }

        export interface DB {
          table: Table;
        }
      `,
    );
  });

  test('nested generics in string overrides', () => {
    const result = serialize({
      customImports: {
        User: './models',
        CustomMap: './types',
      },
      metadata: {
        tables: [
          {
            columns: [
              { dataType: 'json', name: 'complex_field' },
              { dataType: 'json', name: 'user_map' },
            ],
            name: 'complex_types',
            schema: 'public',
          },
        ],
      },
      overrides: {
        columns: {
          'complex_types.complex_field': 'Map<string, Array<Partial<User>>>',
          'complex_types.user_map': 'CustomMap<string, User[]>',
        },
      },
    });

    // Check that all expected imports and types are present
    expect(result).toContain('import type { User } from "./models";');
    expect(result).toContain('import type { CustomMap } from "./types";');
    expect(result).toContain('export interface ComplexTypes');
    expect(result).toContain(
      'complex_field: Map<string, Array<Partial<User>>>;',
    );
    expect(result).toContain('user_map: CustomMap<string, User[]>;');
    expect(result).toContain('export interface DB');
  });

  test('union types in string overrides', () => {
    expect(
      serialize({
        customImports: {
          TypeA: './types',
          TypeB: './types',
          TypeC: './types',
        },
        metadata: {
          tables: [
            {
              columns: [
                { dataType: 'text', name: 'status' },
                { dataType: 'text', name: 'mixed' },
              ],
              name: 'union_table',
              schema: 'public',
            },
          ],
        },
        overrides: {
          columns: {
            'union_table.status': '"active" | "inactive" | "pending"',
            'union_table.mixed': 'TypeA | TypeB | TypeC | null',
          },
        },
      }),
    ).toStrictEqual(
      dedent`
        import type { TypeA, TypeB, TypeC } from "./types";

        export interface UnionTable {
          mixed: TypeA | TypeB | TypeC | null;
          status: "active" | "inactive" | "pending";
        }

        export interface DB {
          union_table: UnionTable;
        }
      `,
    );
  });

  test('intersection types in string overrides', () => {
    expect(
      serialize({
        customImports: {
          Timestamped: './mixins',
          Authored: './mixins',
          BaseModel: './models',
        },
        metadata: {
          tables: [
            {
              columns: [{ dataType: 'json', name: 'entity' }],
              name: 'intersections',
              schema: 'public',
            },
          ],
        },
        overrides: {
          columns: {
            'intersections.entity': 'BaseModel & Timestamped & Authored',
          },
        },
      }),
    ).toStrictEqual(
      dedent`
        import type { Authored, Timestamped } from "./mixins";
        import type { BaseModel } from "./models";

        export interface Intersections {
          entity: BaseModel & Timestamped & Authored;
        }

        export interface DB {
          intersections: Intersections;
        }
      `,
    );
  });

  test('array syntax variations in string overrides', () => {
    expect(
      serialize({
        customImports: {
          CustomType: './types',
          NestedType: './types',
        },
        metadata: {
          tables: [
            {
              columns: [
                { dataType: 'json', name: 'array1' },
                { dataType: 'json', name: 'array2' },
                { dataType: 'json', name: 'array3' },
              ],
              name: 'arrays',
              schema: 'public',
            },
          ],
        },
        overrides: {
          columns: {
            'arrays.array1': 'CustomType[]',
            'arrays.array2': 'Array<CustomType>',
            'arrays.array3': 'NestedType[][]',
          },
        },
      }),
    ).toStrictEqual(
      dedent`
        import type { CustomType, NestedType } from "./types";

        export interface Arrays {
          array1: CustomType[];
          array2: Array<CustomType>;
          array3: NestedType[][];
        }

        export interface DB {
          arrays: Arrays;
        }
      `,
    );
  });

  test('literal types in string overrides', () => {
    const result = serialize({
      metadata: {
        tables: [
          {
            columns: [
              { dataType: 'text', name: 'string_literal' },
              { dataType: 'int', name: 'number_literal' },
              { dataType: 'bool', name: 'boolean_literal' },
              { dataType: 'text', name: 'mixed_literal' },
            ],
            name: 'literals',
            schema: 'public',
          },
        ],
      },
      overrides: {
        columns: {
          'literals.string_literal': '"red" | "green" | "blue"',
          'literals.number_literal': '1 | 2 | 3',
          'literals.boolean_literal': 'true | false',
          'literals.mixed_literal': '"auto" | 100 | true | null',
        },
      },
    });

    // Check that the interface contains the expected types
    // Order of union elements may vary, so we check for presence
    expect(result).toContain('export interface Literals');
    expect(result).toMatch(/boolean_literal: (true \| false|false \| true);/);
    expect(result).toContain('mixed_literal: "auto" | 100 | true | null;');
    expect(result).toContain('number_literal: 1 | 2 | 3;');
    expect(result).toContain('string_literal: "red" | "green" | "blue";');
    expect(result).toContain('export interface DB');
  });

  test('complex mixed type expressions in string overrides', () => {
    expect(
      serialize({
        customImports: {
          JSONColumnType: 'kysely',
          ColumnType: 'kysely',
          UserData: './models',
          Permission: './auth',
        },
        metadata: {
          tables: [
            {
              columns: [
                { dataType: 'serial', name: 'id' },
                { dataType: 'json', name: 'data' },
                { dataType: 'json', name: 'permissions' },
              ],
              name: 'complex',
              schema: 'public',
            },
          ],
        },
        overrides: {
          columns: {
            'complex.id': 'Generated<number>',
            'complex.data':
              'JSONColumnType<Partial<UserData> & { tags: string[] }>',
            'complex.permissions':
              'ColumnType<Permission[], string, Permission[] | null>',
          },
        },
      }),
    ).toStrictEqual(
      dedent`
        import type { Permission } from "./auth";
        import type { UserData } from "./models";
        import type { ColumnType, JSONColumnType } from "kysely";

        export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
          ? ColumnType<S, I | undefined, U>
          : ColumnType<T, T | undefined, T>;

        export interface Complex {
          data: JSONColumnType<Partial<UserData> & { tags: string[] }>;
          id: Generated<number>;
          permissions: ColumnType<Permission[], string, Permission[] | null>;
        }

        export interface DB {
          complex: Complex;
        }
      `,
    );
  });

  test('typeMapping', () => {
    expect(
      serialize({
        customImports: {
          Temporal: '@js-temporal/polyfill',
          InstantRange: './custom-types',
        },
        metadata: {
          tables: [
            {
              columns: [
                { dataType: 'int4', name: 'id' },
                { dataType: 'timestamptz', name: 'created_at' },
                { dataType: 'date', name: 'event_date', isNullable: true },
                { dataType: 'interval', name: 'duration' },
                {
                  dataType: 'tstzrange',
                  name: 'booking_range',
                  isNullable: true,
                },
              ],
              name: 'time_data',
            },
          ],
        },
        typeMapping: {
          timestamptz: 'Temporal.Instant',
          date: 'Temporal.PlainDate',
          interval: 'Temporal.Duration',
          tstzrange: 'InstantRange',
        },
      }),
    ).toStrictEqual(
      dedent`
        import type { InstantRange } from "./custom-types";
        import type { Temporal } from "@js-temporal/polyfill";

        export interface TimeData {
          booking_range: InstantRange | null;
          created_at: Temporal.Instant;
          duration: Temporal.Duration;
          event_date: Temporal.PlainDate | null;
          id: number;
        }

        export interface DB {
          time_data: TimeData;
        }
      `,
    );
  });
});

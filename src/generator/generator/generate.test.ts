import { strictEqual } from 'assert';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { dedent } from 'ts-dedent';
import type { DatabaseMetadataOptions } from '../../introspector';
import { DatabaseMetadata } from '../../introspector';
import { DateParser } from '../../introspector/dialects/postgres/date-parser';
import { NumericParser } from '../../introspector/dialects/postgres/numeric-parser';
import {
  addExtraColumn,
  migrate,
} from '../../introspector/introspector.fixtures';
import { ArrayExpressionNode } from '../ast/array-expression-node';
import { TableIdentifierNode } from '../ast/identifier-node';
import { JsonColumnTypeNode } from '../ast/json-column-type-node';
import { RawExpressionNode } from '../ast/raw-expression-node';
import type { GeneratorDialect } from '../dialect';
import { LibsqlDialect } from '../dialects/libsql/libsql-dialect';
import { MysqlDialect } from '../dialects/mysql/mysql-dialect';
import { PostgresDialect } from '../dialects/postgres/postgres-dialect';
import { SqliteDialect } from '../dialects/sqlite/sqlite-dialect';
import { Logger } from '../logger/logger';
import type { GenerateOptions, SerializeFromMetadataOptions } from './generate';
import { generate, serializeFromMetadata } from './generate';
import { RuntimeEnumsStyle } from './runtime-enums-style';

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
      dateParser: DateParser.STRING,
      numericParser: NumericParser.NUMBER_OR_STRING,
    }),
    generateOptions: { runtimeEnums: RuntimeEnumsStyle.SCREAMING_SNAKE_CASE },
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

  describe('should generate the correct output', () => {
    for (const { connectionString, dialect, generateOptions, name } of TESTS) {
      test(`${dialect.constructor.name} (./${name}.snapshot.ts)`, async () => {
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
      });
    }
  });

  describe('should verify generated types', () => {
    for (const { connectionString, dialect, generateOptions, name } of TESTS) {
      test(`${dialect.constructor.name} (./${name}.snapshot.ts)`, async () => {
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
      });
    }
  });
});

describe(serializeFromMetadata.name, () => {
  const serialize = (
    options: Omit<
      SerializeFromMetadataOptions,
      'dialect' | 'metadata' | 'serializer'
    > & {
      dialect?: GeneratorDialect;
      metadata: DatabaseMetadataOptions;
    },
  ) => {
    return serializeFromMetadata({
      ...options,
      dialect: options.dialect ?? new PostgresDialect(),
      metadata: new DatabaseMetadata(options.metadata),
      skipAutogenerationFileComment: true,
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

  test('dialect', () => {
    expect(
      serialize({
        dialect: new PostgresDialect({
          dateParser: DateParser.STRING,
          numericParser: NumericParser.NUMBER,
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
});

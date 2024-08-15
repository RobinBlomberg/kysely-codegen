import { deepStrictEqual, strictEqual } from 'assert';
import { readFile } from 'fs/promises';
import { type Kysely } from 'kysely';
import type { InsertExpression } from 'kysely/dist/cjs/parser/insert-values-parser';
import { join } from 'path';
import parsePostgresInterval from 'postgres-interval';
import { LibsqlDialect } from '../../dialects/libsql/libsql-dialect';
import { MysqlDialect } from '../../dialects/mysql/mysql-dialect';
import { PostgresDialect } from '../../dialects/postgres/postgres-dialect';
import { SqliteDialect } from '../../dialects/sqlite/sqlite-dialect';
import type { Dialect } from '../../introspector/dialect';
import { addExtraColumn, migrate } from '../../introspector/migrate.fixtures';
import { describe, it } from '../../test.utils';
import { JsonColumnTypeNode } from '../ast/json-column-type-node';
import { RawExpressionNode } from '../ast/raw-expression-node';
import type { GenerateOptions } from '../cli/generator';
import { generate } from '../cli/generator';
import { Logger } from './logger';
import { NumericParser } from './numeric-parser';
import type { DB } from './outputs/postgres.output';

type Test = {
  connectionString: string;
  dialect: Dialect;
  inputValues: Record<string, unknown>;
  outputValues: Record<string, unknown>;
};

const TESTS: Test[] = [
  {
    connectionString: 'mysql://user:password@localhost/database',
    dialect: new MysqlDialect(),
    inputValues: { false: 0, id: 1, true: 1 },
    outputValues: { false: 0, id: 1, true: 1 },
  },
  {
    connectionString: 'postgres://user:password@localhost:5433/database',
    dialect: new PostgresDialect({
      numericParser: NumericParser.NUMBER_OR_STRING,
    }),
    inputValues: {
      false: false,
      id: 1,
      interval1: parsePostgresInterval('1 day'),
      interval2: '24 months',
      numeric1: Number.MAX_SAFE_INTEGER,
      numeric2: String(Number.MAX_SAFE_INTEGER + 1),
      true: true,
    },
    outputValues: {
      false: false,
      id: 1,
      interval1: { days: 1 },
      interval2: { years: 2 },
      numeric1: Number.MAX_SAFE_INTEGER,
      numeric2: String(Number.MAX_SAFE_INTEGER + 1),
      true: true,
    },
  },
  {
    connectionString: ':memory:',
    dialect: new SqliteDialect(),
    inputValues: { false: 0, id: 1, true: 1 },
    outputValues: { false: 0, id: 1, true: 1 },
  },
  {
    connectionString: 'libsql://localhost:8080?tls=0',
    dialect: new LibsqlDialect(),
    inputValues: { false: 0, id: 1, true: 1 },
    outputValues: { false: 0, id: 1, true: 1 },
  },
];

const readDialectOutput = async (dialect: Dialect) => {
  const dialectName = dialect.constructor.name.slice(0, -'Dialect'.length);
  return await readFile(
    join(__dirname, 'outputs', `${dialectName.toLowerCase()}.output.ts`),
    'utf8',
  );
};

const testValues = async (
  db: Kysely<DB>,
  inputValues: Record<string, unknown>,
  outputValues: Record<string, unknown>,
) => {
  await db
    .insertInto('fooBar')
    .values(inputValues as InsertExpression<DB, 'fooBar'>)
    .execute();

  const row = await db
    .selectFrom('fooBar')
    .selectAll()
    .executeTakeFirstOrThrow();

  for (const [key, expectedValue] of Object.entries(outputValues)) {
    const actualValue = row[key as keyof typeof row];

    if (
      actualValue instanceof Object &&
      actualValue.constructor.name === 'PostgresInterval'
    ) {
      deepStrictEqual({ ...actualValue }, expectedValue);
    } else {
      deepStrictEqual(actualValue, expectedValue);
    }
  }
};

export const testE2E = async () => {
  await describe('e2e', async () => {
    const logger = new Logger();

    const baseGenerateOptions: Omit<GenerateOptions, 'db' | 'dialect'> = {
      camelCase: true,
      logger,
      overrides: {
        columns: {
          'foo_bar.json_typed': new JsonColumnTypeNode(
            new RawExpressionNode('{ foo: "bar" }'),
          ),
          'foo_bar.overridden': new RawExpressionNode('"OVERRIDDEN"'),
        },
      },
    };

    await it('should generate the correct output', async () => {
      for (const {
        connectionString,
        dialect,
        inputValues,
        outputValues,
      } of TESTS) {
        logger.info(`Testing ${dialect.constructor.name}...`);

        const db = await migrate(dialect, connectionString);
        await testValues(db, inputValues, outputValues);
        const output = await generate({ ...baseGenerateOptions, db, dialect });
        await db.destroy();
        const expectedOutput = await readDialectOutput(dialect);
        strictEqual(output, expectedOutput);
      }
    });

    await it('should verify generated types', async () => {
      for (const {
        connectionString,
        dialect,
        inputValues,
        outputValues,
      } of TESTS) {
        const dialectName = dialect.constructor.name.slice(
          0,
          -'Dialect'.length,
        );

        logger.info(`Testing ${dialectName}...`);

        const db = await migrate(dialect, connectionString);
        await testValues(db, inputValues, outputValues);
        const outFile = join(
          __dirname,
          'outputs',
          `${dialectName.toLowerCase()}.output.ts`,
        );
        await generate({ ...baseGenerateOptions, db, dialect, outFile });
        const output = await generate({
          ...baseGenerateOptions,
          db,
          dialect,
          outFile,
          verify: true,
        });

        const expectedOutput = await readDialectOutput(dialect);
        strictEqual(output, expectedOutput);

        await addExtraColumn(db);

        try {
          await generate({
            ...baseGenerateOptions,
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
  });
};

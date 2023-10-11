import { deepStrictEqual, strictEqual } from 'assert';
import { readFile } from 'fs/promises';
import { Kysely } from 'kysely';
import { join } from 'path';
import {
  LibSqlDialect,
  MysqlDialect,
  PostgresDialect,
  SqliteDialect,
} from '../dialects';
import { Generator } from '../generator';
import { describe, it } from '../test.utils';
import { Dialect } from './dialect';
import { addExtraColumn, migrate } from './fixtures';
import { Logger } from './logger';
import { DB } from './outputs/postgres.output';

type ExpectedValues = {
  false: any;
  id: 1;
  true: any;
};

type Test = {
  connectionString: string;
  dialect: Dialect;
  values: ExpectedValues;
};

const TESTS: Test[] = [
  {
    connectionString: 'mysql://user:password@localhost/database',
    dialect: new MysqlDialect(),
    values: { false: 0, id: 1, true: 1 },
  },
  {
    connectionString: 'postgres://user:password@localhost:5433/database',
    dialect: new PostgresDialect(),
    values: { false: false, id: 1, true: true },
  },
  {
    connectionString: ':memory:',
    dialect: new SqliteDialect(),
    values: { false: 0, id: 1, true: 1 },
  },
  {
    connectionString: 'libsql://localhost:8080?tls=0',
    dialect: new LibSqlDialect(),
    values: { false: 0, id: 1, true: 1 },
  },
];

const readDialectOutput = async (dialect: Dialect) => {
  const dialectName = dialect.constructor.name.slice(0, -'Dialect'.length);
  return await readFile(
    join(__dirname, 'outputs', `${dialectName.toLowerCase()}.output.ts`),
    'utf8',
  );
};

const testValues = async (db: Kysely<DB>, expectedValues: ExpectedValues) => {
  await db
    .insertInto('fooBar')
    .values({ false: expectedValues.false, true: expectedValues.true })
    .execute();

  const row = await db
    .selectFrom('fooBar')
    .selectAll()
    .executeTakeFirstOrThrow();

  deepStrictEqual(
    { false: row.false, id: row.id, true: row.true },
    expectedValues,
  );
};

export const testE2E = async () => {
  await describe('e2e', async () => {
    const logger = new Logger();

    await it('should generate the correct output', async () => {
      for (const { connectionString, dialect, values } of TESTS) {
        logger.info(`Testing ${dialect.constructor.name}...`);

        const db = await migrate(dialect, connectionString);

        await testValues(db, values);

        const output = await new Generator().generate({
          camelCase: true,
          db,
          dialect,
          logger,
        });

        await db.destroy();

        const expectedOutput = await readDialectOutput(dialect);
        strictEqual(output, expectedOutput);
      }
    });

    await it('verifies generated types', async () => {
      for (const { connectionString, dialect, values } of TESTS) {
        const dialectName = dialect.constructor.name.slice(
          0,
          -'Dialect'.length,
        );

        const outFile = join(
          __dirname,
          'outputs',
          `${dialectName.toLowerCase()}.output.ts`,
        );

        logger.info(`Testing ${dialectName}...`);

        const db = await migrate(dialect, connectionString);

        await testValues(db, values);

        await new Generator().generate({
          camelCase: true,
          db,
          dialect,
          logger,
          outFile,
        });

        const output = await new Generator().generate({
          camelCase: true,
          db,
          dialect,
          logger,
          outFile,
          verify: true,
        });

        const expectedOutput = await readDialectOutput(dialect);
        strictEqual(output, expectedOutput);

        await addExtraColumn(db, dialect);

        try {
          await new Generator().generate({
            camelCase: true,
            db,
            dialect,
            logger,
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

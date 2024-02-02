import { deepStrictEqual, strictEqual } from 'assert';
import { readFile } from 'fs/promises';
import type { Kysely } from 'kysely';
import { join } from 'path';
import { describe, it } from 'vitest';
import type { DialectName } from '../../introspector/index.js';
import { generate } from '../generator/generator.js';
import { addExtraColumn, migrate } from './fixtures/migrate.js';
import { Logger } from './logger.js';
import type { DB } from './outputs/postgres.output.js';

type ExpectedValues = {
  false: any;
  id: 1;
  true: any;
};

type Test = {
  connectionString: string;
  dialectName: DialectName;
  values: ExpectedValues;
};

const TESTS: Test[] = [
  {
    connectionString: ':memory:',
    dialectName: 'bun-sqlite',
    values: { false: 0, id: 1, true: 1 },
  },
  {
    connectionString: 'libsql://localhost:8080?tls=0',
    dialectName: 'libsql',
    values: { false: 0, id: 1, true: 1 },
  },
  {
    connectionString: 'mysql://qwe:qwe@localhost/qwe',
    dialectName: 'mysql',
    values: { false: 0, id: 1, true: 1 },
  },
  {
    connectionString: 'postgres://qwe:qwe@localhost:5433/qwe',
    dialectName: 'postgres',
    values: { false: false, id: 1, true: true },
  },
  {
    connectionString: ':memory:',
    dialectName: 'sqlite',
    values: { false: 0, id: 1, true: 1 },
  },
];

const readDialectOutput = async (dialectName: DialectName) => {
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

describe('e2e', () => {
  const logger = new Logger();

  for (const { connectionString, dialectName, values } of TESTS) {
    describe(dialectName, () => {
      it('should generate the correct output', async () => {
        logger.info(`Testing '${dialectName}'...`);

        const db = await migrate(dialectName, connectionString);

        await testValues(db, values);

        const output = await generate({
          camelCase: true,
          connectionString,
          dialectName,
          logger,
        });

        await db.destroy();

        const expectedOutput = await readDialectOutput(dialectName);
        strictEqual(output, expectedOutput);
      });

      it('verifies generated types', async () => {
        const outFile = join(
          __dirname,
          'outputs',
          `${dialectName.toLowerCase()}.output.ts`,
        );

        logger.info(`Testing ${dialectName}...`);

        const db = await migrate(dialectName, connectionString);

        await testValues(db, values);

        await generate({
          camelCase: true,
          connectionString,
          dialectName,
          logger,
          outFile,
        });

        const output = await generate({
          camelCase: true,
          connectionString,
          dialectName,
          logger,
          outFile,
          verify: true,
        });

        const expectedOutput = await readDialectOutput(dialectName);
        strictEqual(output, expectedOutput);

        await addExtraColumn(db);

        try {
          await generate({
            camelCase: true,
            connectionString,
            dialectName,
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
      });
    });
  }
});

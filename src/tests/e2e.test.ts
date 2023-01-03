import { deepStrictEqual, strictEqual } from 'assert';
import { readFile } from 'fs/promises';
import { Kysely } from 'kysely';
import { join } from 'path';
import { Dialect } from '../dialect';
import { MysqlDialect, PostgresDialect, SqliteDialect } from '../dialects';
import { Generator } from '../generator';
import { Logger } from '../logger';
import { migrate } from './fixtures';
import { DB } from './outputs/postgres.output';
import { describe, it } from './test.utils';

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
    connectionString: 'postgres://user:password@localhost/database',
    dialect: new PostgresDialect(),
    values: { false: false, id: 1, true: true },
  },
  {
    connectionString: ':memory:',
    dialect: new SqliteDialect(),
    values: { false: 0, id: 1, true: 1 },
  },
];

const readDialectOutput = async (dialect: Dialect) => {
  const dialectName = dialect.constructor.name.slice(0, -'Dialect'.length);
  return await readFile(
    join(__dirname, 'outputs', `${dialectName.toLowerCase()}.output.ts`),
    'utf-8',
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
    await it('should generate the correct output', async () => {
      const logger = new Logger();

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
  });
};

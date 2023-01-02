import { strictEqual } from 'assert';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { MysqlDialect, PostgresDialect, SqliteDialect } from '../dialects';
import { Generator } from '../generator';
import { Logger } from '../logger';
import { migrate } from './fixtures';
import { describe, it } from './test.utils';

const createTests = async () => [
  {
    connectionString: 'mysql://user:password@localhost/database',
    dialect: new MysqlDialect(),
    expectedOutput: await readFile(
      join(__dirname, 'outputs', 'mysql.output.ts'),
      'utf-8',
    ),
  },
  {
    connectionString: 'postgres://user:password@localhost/database',
    dialect: new PostgresDialect(),
    expectedOutput: await readFile(
      join(__dirname, 'outputs', 'postgres.output.ts'),
      'utf-8',
    ),
  },
  {
    connectionString: 'C:/Program Files/sqlite3/db',
    dialect: new SqliteDialect(),
    expectedOutput: await readFile(
      join(__dirname, 'outputs', 'sqlite.output.ts'),
      'utf-8',
    ),
  },
];

export const testE2E = async () => {
  await describe('e2e', async () => {
    await it('should generate the correct output', async () => {
      const tests = await createTests();

      for (const { connectionString, dialect, expectedOutput } of tests) {
        new Logger().info(`Testing ${dialect.constructor.name}...`);

        const db = await migrate(dialect, connectionString);

        const output = await new Generator().generate({
          camelCase: true,
          db,
          dialect,
        });

        await db.destroy();

        strictEqual(output, expectedOutput);
      }
    });
  });
};

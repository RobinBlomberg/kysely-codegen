import { strictEqual } from 'assert';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { describe, test } from 'vitest';
import { NumericParser } from '../../introspector/dialects/postgres/numeric-parser';
import {
  addExtraColumn,
  migrate,
} from '../../introspector/introspector.fixtures';
import { JsonColumnTypeNode } from '../ast/json-column-type-node';
import { RawExpressionNode } from '../ast/raw-expression-node';
import type { GeneratorDialect } from '../dialect';
import { LibsqlDialect } from '../dialects/libsql/libsql-dialect';
import { MysqlDialect } from '../dialects/mysql/mysql-dialect';
import { PostgresDialect } from '../dialects/postgres/postgres-dialect';
import { SqliteDialect } from '../dialects/sqlite/sqlite-dialect';
import type { GenerateOptions } from './generate';
import { generate } from './generate';

type Test = {
  connectionString: string;
  dialect: GeneratorDialect;
};

const SNAPSHOTS_DIR = join(__dirname, 'snapshots');

const TESTS: Test[] = [
  {
    connectionString: 'mysql://user:password@localhost/database',
    dialect: new MysqlDialect(),
  },
  {
    connectionString: 'postgres://user:password@localhost:5433/database',
    dialect: new PostgresDialect({
      numericParser: NumericParser.NUMBER_OR_STRING,
    }),
  },
  {
    connectionString: ':memory:',
    dialect: new SqliteDialect(),
  },
  {
    connectionString: 'libsql://localhost:8080?tls=0',
    dialect: new LibsqlDialect(),
  },
];

const readDialectOutput = async (dialect: GeneratorDialect) => {
  const dialectName = dialect.constructor.name.slice(0, -'Dialect'.length);
  return await readFile(
    join(SNAPSHOTS_DIR, `${dialectName.toLowerCase()}.snapshot.ts`),
    'utf8',
  );
};

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
    for (const { connectionString, dialect } of TESTS) {
      test(dialect.constructor.name, async () => {
        const db = await migrate(dialect, connectionString);
        const output = await generate({ ...baseGenerateOptions, db, dialect });
        await db.destroy();
        const expectedOutput = await readDialectOutput(dialect);
        strictEqual(output, expectedOutput);
      });
    }
  });

  describe('should verify generated types', () => {
    for (const { connectionString, dialect } of TESTS) {
      test(dialect.constructor.name, async () => {
        const db = await migrate(dialect, connectionString);
        const dialectName = dialect.constructor.name.slice(
          0,
          -'Dialect'.length,
        );
        const outFile = join(
          SNAPSHOTS_DIR,
          `${dialectName.toLowerCase()}.snapshot.ts`,
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
      });
    }
  });
});

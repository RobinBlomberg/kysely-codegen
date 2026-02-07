import { type Kysely } from 'kysely';
import { deepStrictEqual } from 'node:assert';
import parsePostgresInterval from 'postgres-interval';
import { migrate } from '../introspector/introspector.fixtures';
import type { IntrospectorDialect } from './dialect';
import { LibsqlIntrospectorDialect } from './dialects/libsql/libsql-dialect';
import { MysqlIntrospectorDialect } from './dialects/mysql/mysql-dialect';
import { PostgresIntrospectorDialect } from './dialects/postgres/postgres-dialect';
import { SqliteIntrospectorDialect } from './dialects/sqlite/sqlite-dialect';
import { EnumCollection } from './enum-collection';
import { Introspector } from './introspector';
import { ColumnMetadata } from './metadata/column-metadata';
import { DatabaseMetadata } from './metadata/database-metadata';
import { TableMetadata } from './metadata/table-metadata';

type Test = {
  connectionString: string;
  dialect: IntrospectorDialect;
  inputValues: Record<string, unknown>;
  outputValues: Record<string, unknown>;
};

const TESTS: Test[] = [
  {
    connectionString: 'mysql://user:password@localhost/database',
    dialect: new MysqlIntrospectorDialect(),
    inputValues: { false: 0, id: 1, true: 1 },
    outputValues: { false: 0, id: 1, true: 1 },
  },
  {
    connectionString: 'postgres://user:password@localhost:5433/database',
    dialect: new PostgresIntrospectorDialect({
      dateParser: 'string',
      numericParser: 'number-or-string',
    }),
    inputValues: {
      date: '2024-10-14',
      enum: 'foo',
      false: false,
      id: 1,
      interval1: parsePostgresInterval('1 day'),
      interval2: '24 months',
      numeric1: Number.MAX_SAFE_INTEGER,
      numeric2: String(Number.MAX_SAFE_INTEGER + 1),
      timestamps: ['2024-09-17T08:05:00.000Z'],
      true: true,
    },
    outputValues: {
      date: '2024-10-14',
      enum: 'foo',
      false: false,
      id: 1,
      interval1: { days: 1 },
      interval2: { years: 2 },
      numeric1: Number.MAX_SAFE_INTEGER,
      numeric2: String(Number.MAX_SAFE_INTEGER + 1),
      timestamps: [new Date('2024-09-17T08:05:00.000Z')],
      true: true,
    },
  },
  {
    connectionString: ':memory:',
    dialect: new SqliteIntrospectorDialect(),
    inputValues: { false: 0, id: 1, true: 1 },
    outputValues: { false: 0, id: 1, true: 1 },
  },
  {
    connectionString: 'libsql://localhost:8080?tls=0',
    dialect: new LibsqlIntrospectorDialect(),
    inputValues: { false: 0, id: 1, true: 1 },
    outputValues: { false: 0, id: 1, true: 1 },
  },
];

const testValues = async (
  db: Kysely<any>,
  inputValues: Record<string, unknown>,
  outputValues: Record<string, unknown>,
) => {
  await db.insertInto('fooBar').values(inputValues).execute();

  const row = await db
    .selectFrom('fooBar')
    .selectAll()
    .executeTakeFirstOrThrow();

  for (const [key, expectedValue] of Object.entries(outputValues)) {
    const actualValue = row[key];

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

describe(Introspector.name, () => {
  it('should return the correct metadata for each dialect', async () => {
    for (const {
      connectionString,
      dialect,
      inputValues,
      outputValues,
    } of TESTS) {
      const db = await migrate(dialect, connectionString);
      await testValues(db, inputValues, outputValues);
      const metadata = await dialect.introspector.introspect({ db });

      if (dialect instanceof MysqlIntrospectorDialect) {
        deepStrictEqual(
          metadata,
          new DatabaseMetadata({
            tables: [
              new TableMetadata({
                columns: [
                  new ColumnMetadata({
                    dataType: 'tinyint',
                    name: 'false',
                  }),
                  new ColumnMetadata({
                    dataType: 'tinyint',
                    name: 'true',
                  }),
                  new ColumnMetadata({
                    dataType: 'text',
                    isNullable: true,
                    name: 'overridden',
                  }),
                  new ColumnMetadata({
                    dataType: 'bigint',
                    isAutoIncrementing: true,
                    name: 'id',
                  }),
                  new ColumnMetadata({
                    dataType: 'enum',
                    enumValues: ['CONFIRMED', 'UNCONFIRMED'],
                    isNullable: true,
                    name: 'user_status',
                  }),
                ],
                name: 'foo_bar',
                schema: 'database',
              }),
            ],
          }),
        );
      } else if (dialect instanceof PostgresIntrospectorDialect) {
        deepStrictEqual(
          metadata,
          new DatabaseMetadata({
            enums: new EnumCollection({
              'public.status': ['CONFIRMED', 'UNCONFIRMED'],
              'test.status': ['ABC_DEF', 'GHI_JKL'],
            }),
            tables: [
              new TableMetadata({
                columns: [
                  new ColumnMetadata({
                    dataType: 'text',
                    dataTypeSchema: 'pg_catalog',
                    name: 'name',
                  }),
                ],
                name: 'enum',
                schema: 'public',
              }),
              new TableMetadata({
                columns: [
                  new ColumnMetadata({
                    comment:
                      "This is a comment on a column.\r\n\r\nIt's nice, isn't it?",
                    dataType: 'bool',
                    dataTypeSchema: 'pg_catalog',
                    name: 'false',
                  }),
                  new ColumnMetadata({
                    dataType: 'bool',
                    dataTypeSchema: 'pg_catalog',
                    name: 'true',
                  }),
                  new ColumnMetadata({
                    dataType: 'text',
                    dataTypeSchema: 'pg_catalog',
                    isNullable: true,
                    name: 'overridden',
                  }),
                  new ColumnMetadata({
                    dataType: 'int4',
                    dataTypeSchema: 'pg_catalog',
                    hasDefaultValue: true,
                    isAutoIncrementing: true,
                    name: 'id',
                  }),
                  new ColumnMetadata({
                    dataType: 'date',
                    dataTypeSchema: 'pg_catalog',
                    isNullable: true,
                    name: 'date',
                  }),
                  new ColumnMetadata({
                    dataType: 'status',
                    dataTypeSchema: 'public',
                    enumValues: ['CONFIRMED', 'UNCONFIRMED'],
                    isNullable: true,
                    name: 'user_status',
                  }),
                  new ColumnMetadata({
                    dataType: 'status',
                    dataTypeSchema: 'test',
                    enumValues: ['ABC_DEF', 'GHI_JKL'],
                    isNullable: true,
                    name: 'user_status_2',
                  }),
                  new ColumnMetadata({
                    dataType: 'text',
                    dataTypeSchema: 'pg_catalog',
                    isArray: true,
                    isNullable: true,
                    name: 'array',
                  }),
                  new ColumnMetadata({
                    dataType: 'int4',
                    dataTypeSchema: 'public',
                    isNullable: true,
                    name: 'nullable_pos_int',
                  }),
                  new ColumnMetadata({
                    dataType: 'int4',
                    dataTypeSchema: 'public',
                    hasDefaultValue: true,
                    isNullable: true,
                    name: 'defaulted_nullable_pos_int',
                  }),
                  new ColumnMetadata({
                    dataType: 'int4',
                    dataTypeSchema: 'public',
                    hasDefaultValue: true,
                    name: 'defaulted_required_pos_int',
                  }),
                  new ColumnMetadata({
                    dataType: 'int4',
                    dataTypeSchema: 'public',
                    isNullable: true,
                    name: 'child_domain',
                  }),
                  new ColumnMetadata({
                    dataType: 'bool',
                    dataTypeSchema: 'test',
                    isNullable: true,
                    name: 'test_domain_is_bool',
                  }),
                  new ColumnMetadata({
                    dataType: 'timestamptz',
                    dataTypeSchema: 'pg_catalog',
                    isArray: true,
                    isNullable: true,
                    name: 'timestamps',
                  }),
                  new ColumnMetadata({
                    dataType: 'interval',
                    dataTypeSchema: 'pg_catalog',
                    isNullable: true,
                    name: 'interval1',
                  }),
                  new ColumnMetadata({
                    dataType: 'interval',
                    dataTypeSchema: 'pg_catalog',
                    isNullable: true,
                    name: 'interval2',
                  }),
                  new ColumnMetadata({
                    dataType: 'json',
                    dataTypeSchema: 'pg_catalog',
                    isNullable: true,
                    name: 'json',
                  }),
                  new ColumnMetadata({
                    dataType: 'json',
                    dataTypeSchema: 'pg_catalog',
                    isNullable: true,
                    name: 'json_typed',
                  }),
                  new ColumnMetadata({
                    dataType: 'numeric',
                    dataTypeSchema: 'pg_catalog',
                    isNullable: true,
                    name: 'numeric1',
                  }),
                  new ColumnMetadata({
                    dataType: 'numeric',
                    dataTypeSchema: 'pg_catalog',
                    isNullable: true,
                    name: 'numeric2',
                  }),
                  new ColumnMetadata({
                    dataType: 'text',
                    dataTypeSchema: 'pg_catalog',
                    name: 'enum',
                  }),
                ],
                name: 'foo_bar',
                schema: 'public',
              }),
              new TableMetadata({
                columns: [
                  new ColumnMetadata({
                    dataType: 'int4',
                    dataTypeSchema: 'pg_catalog',
                    hasDefaultValue: true,
                    isAutoIncrementing: true,
                    name: 'id',
                  }),
                ],
                name: 'partitioned_table',
                schema: 'public',
              }),
              new TableMetadata({
                columns: [
                  new ColumnMetadata({
                    dataType: 'int4',
                    dataTypeSchema: 'pg_catalog',
                    isNullable: true,
                    name: 'id',
                  }),
                  new ColumnMetadata({
                    dataType: 'bool',
                    dataTypeSchema: 'pg_catalog',
                    isNullable: true,
                    name: 'true',
                  }),
                  new ColumnMetadata({
                    dataType: 'bool',
                    dataTypeSchema: 'pg_catalog',
                    isNullable: true,
                    name: 'false',
                  }),
                ],
                isView: true,
                name: 'foo_bar_mv',
                schema: 'public',
              }),
            ],
          }),
        );
      } else if (dialect instanceof SqliteIntrospectorDialect) {
        deepStrictEqual(
          metadata,
          new DatabaseMetadata({
            tables: [
              new TableMetadata({
                columns: [
                  new ColumnMetadata({
                    dataType: 'boolean',
                    name: 'false',
                  }),
                  new ColumnMetadata({
                    dataType: 'boolean',
                    name: 'true',
                  }),
                  new ColumnMetadata({
                    dataType: 'TEXT',
                    isNullable: true,
                    name: 'overridden',
                  }),
                  new ColumnMetadata({
                    dataType: 'INTEGER',
                    isAutoIncrementing: true,
                    name: 'id',
                  }),
                  new ColumnMetadata({
                    dataType: 'TEXT',
                    isNullable: true,
                    name: 'user_status',
                  }),
                ],
                name: 'foo_bar',
              }),
            ],
          }),
        );
      }
    }
  });
});

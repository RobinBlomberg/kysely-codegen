import { type Kysely } from 'kysely';
import { deepStrictEqual } from 'node:assert';
import { ColumnMetadata } from '../../metadata/column-metadata';
import { DatabaseMetadata } from '../../metadata/database-metadata';
import { TableMetadata } from '../../metadata/table-metadata';

import { EnumCollection } from '../../enum-collection';
import { ClickHouseIntrospectorDialect } from './clickhouse-dialect';
import { ClickHouseIntrospector } from './clickhouse-introspector';
import { migrate } from './clickhouse-introspector.fixtures';

const testValues = async (
  db: Kysely<any>,
  inputValues: Record<string, unknown>,
  outputValues: Record<string, unknown>,
) => {
  await db.insertInto('test_db.foo_bar').values(inputValues).execute();

  const row = await db
    .selectFrom('test_db.foo_bar')
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

describe(ClickHouseIntrospector.name, () => {
  it('should return the correct metadata', async () => {
    const db = await migrate('http://default:password@localhost:8123');
    await testValues(
      db,
      {
        id: '00000000-0000-0000-0000-000000000000',
        int8: -100,
        int16: -1000,
        int32: -10_000,
        int64: -100_000,
        int128: -100_000_000,
        int256: -100_000_000_000,
        uint8: 100,
        uint16: 1000,
        uint32: 10_000,
        uint64: 100_000,
        uint128: 100_000_000,
        uint256: 100_000_000_000,
        float32: 1.23,
        float64: 1.23,
        decimal: 1.23,
        decimal32: 1.23,
        decimal64: 1.23,
        decimal128: 1.23,
        decimal256: 1.23,
        string: 'string',
        fixed_string: 'fixedstring',
        datetime: '2024-10-14 12:00:00',
        datetime64: '2024-10-14 12:00:00.000000',
        false: 0,
        true: 1,
        confirmation_enum: 'CONFIRMED',
        json: { a: 1, b: [0, 1, 2] },
        string_array: ['a', 'b', 'c'],
        low_cardinality_string: 'a',
        nullable_string: null,
      },
      {
        id: '00000000-0000-0000-0000-000000000000',
        int8: -100,
        int16: -1000,
        int32: -10_000,
        int64: -100_000,
        int128: -100_000_000,
        int256: -100_000_000_000,
        uint8: 100,
        uint16: 1000,
        uint32: 10_000,
        uint64: 100_000,
        uint128: 100_000_000,
        uint256: 100_000_000_000,
        float32: 1.23,
        float64: 1.23,
        decimal: 1.23,
        decimal32: 1.23,
        decimal64: 1.23,
        decimal128: 1.23,
        decimal256: 1.23,
        string: 'string',
        fixed_string: 'fixedstring',
        datetime: '2024-10-14 12:00:00',
        datetime64: '2024-10-14 12:00:00.000000',
        false: 0,
        true: 1,
        confirmation_enum: 'CONFIRMED',
        json: { a: 1, b: [0, 1, 2] },
        string_array: ['a', 'b', 'c'],
        low_cardinality_string: 'a',
        nullable_string: null,
      },
    );
    const metadata =
      await new ClickHouseIntrospectorDialect().introspector.introspect({ db });
    deepStrictEqual(
      metadata,
      new DatabaseMetadata({
        enums: new EnumCollection({
          'test_db.foo_bar.confirmation_enum': ['CONFIRMED', 'UNCONFIRMED'],
        }),
        tables: [
          new TableMetadata({
            columns: [
              new ColumnMetadata({
                dataType: 'UUID',
                dataTypeSchema: 'test_db',
                name: 'id',
              }),
              // integer types
              new ColumnMetadata({
                dataType: 'Int8',
                dataTypeSchema: 'test_db',
                name: 'int8',
              }),
              new ColumnMetadata({
                dataType: 'Int16',
                dataTypeSchema: 'test_db',
                name: 'int16',
              }),
              new ColumnMetadata({
                dataType: 'Int32',
                dataTypeSchema: 'test_db',
                name: 'int32',
              }),
              new ColumnMetadata({
                dataType: 'Int64',
                dataTypeSchema: 'test_db',
                name: 'int64',
              }),
              new ColumnMetadata({
                dataType: 'Int128',
                dataTypeSchema: 'test_db',
                name: 'int128',
              }),
              new ColumnMetadata({
                dataType: 'Int256',
                dataTypeSchema: 'test_db',
                name: 'int256',
              }),
              // unsigned integer types
              new ColumnMetadata({
                dataType: 'UInt8',
                dataTypeSchema: 'test_db',
                name: 'uint8',
              }),
              new ColumnMetadata({
                dataType: 'UInt16',
                dataTypeSchema: 'test_db',
                name: 'uint16',
              }),
              new ColumnMetadata({
                dataType: 'UInt32',
                dataTypeSchema: 'test_db',
                name: 'uint32',
              }),
              new ColumnMetadata({
                dataType: 'UInt64',
                dataTypeSchema: 'test_db',
                name: 'uint64',
              }),
              new ColumnMetadata({
                dataType: 'UInt128',
                dataTypeSchema: 'test_db',
                name: 'uint128',
              }),
              new ColumnMetadata({
                dataType: 'UInt256',
                dataTypeSchema: 'test_db',
                name: 'uint256',
              }),
              // floating point types
              new ColumnMetadata({
                dataType: 'Float32',
                dataTypeSchema: 'test_db',
                name: 'float32',
              }),
              new ColumnMetadata({
                dataType: 'Float64',
                dataTypeSchema: 'test_db',
                name: 'float64',
              }),
              // decimal types
              new ColumnMetadata({
                dataType: 'Decimal',
                dataTypeSchema: 'test_db',
                name: 'decimal',
              }),
              new ColumnMetadata({
                dataType: 'Decimal',
                dataTypeSchema: 'test_db',
                name: 'decimal32',
              }),
              new ColumnMetadata({
                dataType: 'Decimal',
                dataTypeSchema: 'test_db',
                name: 'decimal64',
              }),
              new ColumnMetadata({
                dataType: 'Decimal',
                dataTypeSchema: 'test_db',
                name: 'decimal128',
              }),
              new ColumnMetadata({
                dataType: 'Decimal',
                dataTypeSchema: 'test_db',
                name: 'decimal256',
              }),
              // string types
              new ColumnMetadata({
                dataType: 'String',
                dataTypeSchema: 'test_db',
                name: 'string',
              }),
              new ColumnMetadata({
                dataType: 'FixedString',
                dataTypeSchema: 'test_db',
                name: 'fixed_string',
              }),
              // date / datetime types
              new ColumnMetadata({
                dataType: 'Date',
                dataTypeSchema: 'test_db',
                name: 'date',
              }),
              new ColumnMetadata({
                dataType: 'Date32',
                dataTypeSchema: 'test_db',
                name: 'date32',
              }),
              new ColumnMetadata({
                dataType: 'DateTime',
                dataTypeSchema: 'test_db',
                name: 'datetime',
              }),
              new ColumnMetadata({
                dataType: 'DateTime64',
                dataTypeSchema: 'test_db',
                name: 'datetime64',
              }),
              // boolean
              new ColumnMetadata({
                dataType: 'UInt8',
                dataTypeSchema: 'test_db',
                name: 'false',
              }),
              new ColumnMetadata({
                dataType: 'UInt8',
                dataTypeSchema: 'test_db',
                name: 'true',
              }),
              // Miscellaneous types
              new ColumnMetadata({
                dataType: 'Enum8',
                dataTypeSchema: 'test_db',
                enumValues: ['CONFIRMED', 'UNCONFIRMED'],
                name: 'confirmation_enum',
              }),
              new ColumnMetadata({
                dataType: 'JSON',
                dataTypeSchema: 'test_db',
                name: 'json',
              }),
              new ColumnMetadata({
                dataType: 'String',
                dataTypeSchema: 'test_db',
                isArray: true,
                name: 'string_array',
              }),
              new ColumnMetadata({
                dataType: 'String',
                dataTypeSchema: 'test_db',
                name: 'low_cardinality_string',
              }),
              new ColumnMetadata({
                dataType: 'String',
                dataTypeSchema: 'test_db',
                isNullable: true,
                name: 'nullable_string',
              }),
            ],
            name: 'foo_bar',
            schema: 'test_db',
          }),
        ],
      }),
    );
  });
});

import { Kysely, sql } from 'kysely';
import assert from 'node:assert';

import { IntrospectorDialect } from '../../dialect';

import { ClickHouseIntrospectorDialect } from './clickhouse-dialect';

const down = async (db: Kysely<any>, dialect: IntrospectorDialect) => {
  assert(dialect instanceof IntrospectorDialect);

  await sql`DROP DATABASE IF EXISTS test_db`.execute(db);
  await db.schema.dropTable('foo_bar').ifExists().execute();
};

const up = async (db: Kysely<any>, dialect: IntrospectorDialect) => {
  assert(dialect instanceof IntrospectorDialect);

  await down(db, dialect);

  await sql`CREATE DATABASE IF NOT EXISTS test_db`.execute(db);
  await sql`
    CREATE TABLE IF NOT EXISTS test_db.foo_bar (
      id UUID,
      -- integer types
      int8 Int8,
      int16 Int16,
      int32 Int32,
      int64 Int64,
      int128 Int128,
      int256 Int256,
      -- unsigned integer types
      uint8 UInt8,
      uint16 UInt16,
      uint32 UInt32,
      uint64 UInt64,
      uint128 UInt128,
      uint256 UInt256,
      -- floating point types
      float32 Float32,
      float64 Float64,
      -- decimal types
      decimal Decimal(10, 2),
      decimal32 Decimal32(8),
      decimal64 Decimal64(16),
      decimal128 Decimal128(32),
      decimal256 Decimal256(64),
      -- string types
      string String,
      fixed_string FixedString(11),
      -- date / datetime types
      date Date,
      date32 Date32,
      datetime DateTime,
      datetime64 DateTime64(6, 'UTC'),
      -- boolean types
      false UInt8,
      true UInt8,

      confirmation_enum Enum('CONFIRMED', 'UNCONFIRMED'),
      json JSON,
      string_array Array(String),
      low_cardinality_string LowCardinality(String),
      nullable_string Nullable(String)
    ) ENGINE = ReplacingMergeTree()
    ORDER BY id
  `.execute(db);
};

export const migrate = async (connectionString: string) => {
  const dialect = new ClickHouseIntrospectorDialect();
  const db = new Kysely<any>({
    dialect: await dialect.createKyselyDialect({ connectionString }),
  });

  await up(db, dialect);

  return db;
};

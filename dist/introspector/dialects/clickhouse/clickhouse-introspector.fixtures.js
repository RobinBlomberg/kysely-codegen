"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = void 0;
const kysely_1 = require("kysely");
const node_assert_1 = __importDefault(require("node:assert"));
const dialect_1 = require("../../dialect");
const clickhouse_dialect_1 = require("./clickhouse-dialect");
const down = async (db, dialect) => {
    (0, node_assert_1.default)(dialect instanceof dialect_1.IntrospectorDialect);
    await (0, kysely_1.sql) `DROP DATABASE IF EXISTS test_db`.execute(db);
    await db.schema.dropTable('foo_bar').ifExists().execute();
};
const up = async (db, dialect) => {
    (0, node_assert_1.default)(dialect instanceof dialect_1.IntrospectorDialect);
    await down(db, dialect);
    await (0, kysely_1.sql) `CREATE DATABASE IF NOT EXISTS test_db`.execute(db);
    await (0, kysely_1.sql) `
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
const migrate = async (connectionString) => {
    const dialect = new clickhouse_dialect_1.ClickHouseIntrospectorDialect();
    const db = new kysely_1.Kysely({
        dialect: await dialect.createKyselyDialect({ connectionString }),
    });
    await up(db, dialect);
    return db;
};
exports.migrate = migrate;
//# sourceMappingURL=clickhouse-introspector.fixtures.js.map
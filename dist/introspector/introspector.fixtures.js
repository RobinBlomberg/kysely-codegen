"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = exports.addExtraColumn = void 0;
const kysely_1 = require("kysely");
const node_assert_1 = __importDefault(require("node:assert"));
const dialect_1 = require("./dialect");
const clickhouse_dialect_1 = require("./dialects/clickhouse/clickhouse-dialect");
const clickhouse_introspector_fixtures_1 = require("./dialects/clickhouse/clickhouse-introspector.fixtures");
const mysql_dialect_1 = require("./dialects/mysql/mysql-dialect");
const postgres_dialect_1 = require("./dialects/postgres/postgres-dialect");
const down = async (db, dialect) => {
    (0, node_assert_1.default)(dialect instanceof dialect_1.IntrospectorDialect);
    await db.schema.dropTable('boolean').ifExists().execute();
    await db.schema.dropTable('foo_bar').ifExists().execute();
    if (dialect instanceof postgres_dialect_1.PostgresIntrospectorDialect) {
        await db.schema.dropSchema('cli').ifExists().cascade().execute();
        await db.schema.withSchema('test').dropType('status').ifExists().execute();
        await db.schema.withSchema('test').dropType('is_bool').ifExists().execute();
        await db.schema.dropSchema('test').ifExists().execute();
        await db.schema.dropType('status').ifExists().execute();
        await db.schema.dropType('pos_int_child').ifExists().execute();
        await db.schema.dropType('pos_int').ifExists().execute();
        await db.schema.dropTable('partitioned_table').ifExists().execute();
        await db.schema.dropTable('enum').ifExists().execute();
    }
};
const up = async (db, dialect) => {
    (0, node_assert_1.default)(dialect instanceof dialect_1.IntrospectorDialect);
    await down(db, dialect);
    if (dialect instanceof postgres_dialect_1.PostgresIntrospectorDialect) {
        await db.schema.createSchema('test').execute();
        await (0, kysely_1.sql) `create domain test.is_bool as boolean;`.execute(db);
        await db.schema
            .withSchema('test')
            .createType('status')
            .asEnum(['ABC_DEF', 'GHI_JKL'])
            .execute();
        await db.schema
            .createType('status')
            .asEnum(['CONFIRMED', 'UNCONFIRMED'])
            .execute();
        await (0, kysely_1.sql) `create domain pos_int as integer constraint positive_number check (value >= 0);`.execute(db);
        // Edge case where a domain is a child of another domain:
        await (0, kysely_1.sql) `create domain pos_int_child as pos_int;`.execute(db);
    }
    let builder = db.schema
        .createTable('foo_bar')
        .addColumn('false', 'boolean', (col) => col.notNull())
        .addColumn('true', 'boolean', (col) => col.notNull())
        .addColumn('overridden', (0, kysely_1.sql) `text`);
    if (dialect instanceof mysql_dialect_1.MysqlIntrospectorDialect) {
        builder = builder
            .addColumn('id', 'serial')
            .addColumn('user_status', (0, kysely_1.sql) `enum('CONFIRMED','UNCONFIRMED')`);
    }
    else if (dialect instanceof postgres_dialect_1.PostgresIntrospectorDialect) {
        builder = builder
            .addColumn('id', 'serial')
            .addColumn('date', 'date')
            .addColumn('user_status', (0, kysely_1.sql) `status`)
            .addColumn('user_status_2', (0, kysely_1.sql) `test.status`)
            .addColumn('array', (0, kysely_1.sql) `text[]`)
            .addColumn('nullable_pos_int', (0, kysely_1.sql) `pos_int`)
            .addColumn('defaulted_nullable_pos_int', (0, kysely_1.sql) `pos_int`, (col) => col.defaultTo(0))
            .addColumn('defaulted_required_pos_int', (0, kysely_1.sql) `pos_int`, (col) => col.notNull().defaultTo(0))
            .addColumn('child_domain', (0, kysely_1.sql) `pos_int_child`)
            .addColumn('test_domain_is_bool', (0, kysely_1.sql) `test.is_bool`)
            .addColumn('timestamps', (0, kysely_1.sql) `timestamp with time zone[]`)
            .addColumn('interval1', (0, kysely_1.sql) `interval`)
            .addColumn('interval2', (0, kysely_1.sql) `interval`)
            .addColumn('json', (0, kysely_1.sql) `json`)
            .addColumn('json_typed', (0, kysely_1.sql) `json`)
            .addColumn('numeric1', (0, kysely_1.sql) `numeric`)
            .addColumn('numeric2', (0, kysely_1.sql) `numeric`);
    }
    else {
        builder = builder
            .addColumn('id', 'integer', (col) => col.autoIncrement().notNull().primaryKey())
            .addColumn('user_status', 'text');
    }
    await builder.execute();
    if (dialect instanceof postgres_dialect_1.PostgresIntrospectorDialect) {
        await db.executeQuery((0, kysely_1.sql) `
        comment on column foo_bar.false is
        'This is a comment on a column.\r\n\r\nIt''s nice, isn''t it?';
      `.compile(db));
        await db.schema
            .createTable('partitioned_table')
            .addColumn('id', 'serial')
            .modifyEnd((0, kysely_1.sql) `partition by range (id)`)
            .execute();
        await db.schema
            .createTable('enum')
            .addColumn('name', 'text', (col) => col.primaryKey().notNull())
            .execute();
        await db.executeQuery((0, kysely_1.sql) `comment on table enum is '@enum';`.compile(db));
        await db.schema
            .alterTable('foo_bar')
            .addColumn('enum', (0, kysely_1.sql) `text not null references enum(name)`)
            .execute();
        await db
            .insertInto('enum')
            .values([{ name: 'foo' }, { name: 'bar' }])
            .onConflict((oc) => oc.doNothing())
            .execute();
        await db.executeQuery((0, kysely_1.sql) `
        create table partition_1 partition of partitioned_table for values from (1) to (100);
      `.compile(db));
    }
};
const addExtraColumn = async (db, dialect) => {
    if (dialect instanceof clickhouse_dialect_1.ClickHouseIntrospectorDialect) {
        await (0, kysely_1.sql) `ALTER TABLE test_db.foo_bar ADD COLUMN user_name String DEFAULT 'test'`.execute(db);
        return;
    }
    await db.schema
        .alterTable('foo_bar')
        .addColumn('user_name', 'varchar(50)', (col) => col.defaultTo('test'))
        .execute();
};
exports.addExtraColumn = addExtraColumn;
const migrate = async (dialect, connectionString) => {
    if (dialect instanceof clickhouse_dialect_1.ClickHouseIntrospectorDialect) {
        return await (0, clickhouse_introspector_fixtures_1.migrate)(connectionString);
    }
    const db = new kysely_1.Kysely({
        dialect: await dialect.createKyselyDialect({ connectionString }),
        plugins: [new kysely_1.CamelCasePlugin()],
    });
    await up(db, dialect);
    return db;
};
exports.migrate = migrate;
//# sourceMappingURL=introspector.fixtures.js.map
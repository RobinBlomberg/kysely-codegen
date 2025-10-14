import { CamelCasePlugin, Kysely, sql } from 'kysely';
import assert from 'node:assert';
import { IntrospectorDialect } from './dialect';
import { ClickHouseIntrospectorDialect } from './dialects/clickhouse/clickhouse-dialect';
import { migrate as migrateClickhouse } from './dialects/clickhouse/clickhouse-introspector.fixtures';
import { MysqlIntrospectorDialect } from './dialects/mysql/mysql-dialect';
import { PostgresIntrospectorDialect } from './dialects/postgres/postgres-dialect';

const down = async (db: Kysely<any>, dialect: IntrospectorDialect) => {
  assert(dialect instanceof IntrospectorDialect);

  await db.schema.dropTable('boolean').ifExists().execute();
  await db.schema.dropTable('foo_bar').ifExists().execute();

  if (dialect instanceof PostgresIntrospectorDialect) {
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

const up = async (db: Kysely<any>, dialect: IntrospectorDialect) => {
  assert(dialect instanceof IntrospectorDialect);

  await down(db, dialect);

  if (dialect instanceof PostgresIntrospectorDialect) {
    await db.schema.createSchema('test').execute();
    await sql`create domain test.is_bool as boolean;`.execute(db);
    await db.schema
      .withSchema('test')
      .createType('status')
      .asEnum(['ABC_DEF', 'GHI_JKL'])
      .execute();
    await db.schema
      .createType('status')
      .asEnum(['CONFIRMED', 'UNCONFIRMED'])
      .execute();

    await sql`create domain pos_int as integer constraint positive_number check (value >= 0);`.execute(
      db,
    );
    // Edge case where a domain is a child of another domain:
    await sql`create domain pos_int_child as pos_int;`.execute(db);
  }

  let builder = db.schema
    .createTable('foo_bar')
    .addColumn('false', 'boolean', (col) => col.notNull())
    .addColumn('true', 'boolean', (col) => col.notNull())
    .addColumn('overridden', sql`text`);

  if (dialect instanceof MysqlIntrospectorDialect) {
    builder = builder
      .addColumn('id', 'serial')
      .addColumn('user_status', sql`enum('CONFIRMED','UNCONFIRMED')`);
  } else if (dialect instanceof PostgresIntrospectorDialect) {
    builder = builder
      .addColumn('id', 'serial')
      .addColumn('date', 'date')
      .addColumn('user_status', sql`status`)
      .addColumn('user_status_2', sql`test.status`)
      .addColumn('array', sql`text[]`)
      .addColumn('nullable_pos_int', sql`pos_int`)
      .addColumn('defaulted_nullable_pos_int', sql`pos_int`, (col) =>
        col.defaultTo(0),
      )
      .addColumn('defaulted_required_pos_int', sql`pos_int`, (col) =>
        col.notNull().defaultTo(0),
      )
      .addColumn('child_domain', sql`pos_int_child`)
      .addColumn('test_domain_is_bool', sql`test.is_bool`)
      .addColumn('timestamps', sql`timestamp with time zone[]`)
      .addColumn('interval1', sql`interval`)
      .addColumn('interval2', sql`interval`)
      .addColumn('json', sql`json`)
      .addColumn('json_typed', sql`json`)
      .addColumn('numeric1', sql`numeric`)
      .addColumn('numeric2', sql`numeric`);
  } else {
    builder = builder
      .addColumn('id', 'integer', (col) =>
        col.autoIncrement().notNull().primaryKey(),
      )
      .addColumn('user_status', 'text');
  }

  await builder.execute();

  if (dialect instanceof PostgresIntrospectorDialect) {
    await db.executeQuery(
      sql`
        comment on column foo_bar.false is
        'This is a comment on a column.\r\n\r\nIt''s nice, isn''t it?';
      `.compile(db),
    );
    await db.schema
      .createTable('partitioned_table')
      .addColumn('id', 'serial')
      .modifyEnd(sql`partition by range (id)`)
      .execute();
    await db.schema
      .createTable('enum')
      .addColumn('name', 'text', (col) => col.primaryKey().notNull())
      .execute();
    await db.executeQuery(sql`comment on table enum is '@enum';`.compile(db));
    await db.schema
      .alterTable('foo_bar')
      .addColumn('enum', sql`text not null references enum(name)`)
      .execute();
    await db
      .insertInto('enum')
      .values([{ name: 'foo' }, { name: 'bar' }])
      .onConflict((oc) => oc.doNothing())
      .execute();
    await db.executeQuery(
      sql`
        create table partition_1 partition of partitioned_table for values from (1) to (100);
      `.compile(db),
    );
  }
};

export const addExtraColumn = async (
  db: Kysely<any>,
  dialect?: IntrospectorDialect,
) => {
  if (dialect instanceof ClickHouseIntrospectorDialect) {
    await sql`ALTER TABLE test_db.foo_bar ADD COLUMN user_name String DEFAULT 'test'`.execute(
      db,
    );
    return;
  }

  await db.schema
    .alterTable('foo_bar')
    .addColumn('user_name', 'varchar(50)', (col) => col.defaultTo('test'))
    .execute();
};

export const migrate = async (
  dialect: IntrospectorDialect,
  connectionString: string,
) => {
  if (dialect instanceof ClickHouseIntrospectorDialect) {
    return await migrateClickhouse(connectionString);
  }

  const db = new Kysely<any>({
    dialect: await dialect.createKyselyDialect({ connectionString }),
    plugins: [new CamelCasePlugin()],
  });

  await up(db, dialect);

  return db;
};

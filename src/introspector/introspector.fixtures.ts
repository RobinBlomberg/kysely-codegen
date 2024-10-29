import assert from 'assert';
import { CamelCasePlugin, Kysely, sql } from 'kysely';
import { IntrospectorDialect } from './dialect';
import { MysqlIntrospectorDialect } from './dialects/mysql/mysql-dialect';
import { PostgresIntrospectorDialect } from './dialects/postgres/postgres-dialect';

const down = async (db: Kysely<any>, dialect: IntrospectorDialect) => {
  assert(dialect instanceof IntrospectorDialect);

  await db.transaction().execute(async (trx) => {
    await trx.schema.dropTable('boolean').ifExists().execute();
    await trx.schema.dropTable('foo_bar').ifExists().execute();

    if (dialect instanceof PostgresIntrospectorDialect) {
      await trx.schema
        .withSchema('test')
        .dropType('status')
        .ifExists()
        .execute();
      await trx.schema
        .withSchema('test')
        .dropType('is_bool')
        .ifExists()
        .execute();
      await trx.schema.dropSchema('test').ifExists().execute();
      await trx.schema.dropType('status').ifExists().execute();
      await trx.schema.dropType('pos_int_child').ifExists().execute();
      await trx.schema.dropType('pos_int').ifExists().execute();
      await trx.schema.dropTable('partitioned_table').ifExists().execute();
    }
  });
};

const up = async (db: Kysely<any>, dialect: IntrospectorDialect) => {
  assert(dialect instanceof IntrospectorDialect);

  await db.transaction().execute(async (trx) => {
    if (dialect instanceof PostgresIntrospectorDialect) {
      await trx.schema.createSchema('test').ifNotExists().execute();
      await trx.schema
        .withSchema('test')
        .createType('status')
        .asEnum(['ABC_DEF', 'GHI_JKL'])
        .execute();
      await trx.schema
        .createType('status')
        .asEnum(['CONFIRMED', 'UNCONFIRMED'])
        .execute();

      await sql`CREATE domain pos_int AS Integer CONSTRAINT positive_number CHECK (value >= 0);`.execute(
        trx,
      );
      // Edge case where a domain is a child of another domain:
      await sql`CREATE domain pos_int_child as pos_int;`.execute(trx);
      await sql`CREATE domain test.is_bool as boolean;`.execute(trx);
    }

    let builder = trx.schema
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
      await trx.executeQuery(
        sql`
          comment on column foo_bar.false is
          'This is a comment on a column.\r\n\r\nIt''s nice, isn''t it?';
        `.compile(trx),
      );
      await trx.schema
        .createTable('partitioned_table')
        .addColumn('id', 'serial')
        .modifyEnd(sql`partition by range (id)`)
        .execute();
      await trx.executeQuery(
        sql`
          create table partition_1 partition of partitioned_table for values from (1) to (100);
        `.compile(trx),
      );
    }
  });
};

export const addExtraColumn = async (db: Kysely<any>) => {
  await db.transaction().execute(async (trx) => {
    const builder = trx.schema
      .alterTable('foo_bar')
      .addColumn('user_name', 'varchar(50)', (col) => col.defaultTo('test'));
    await builder.execute();
  });
};

export const migrate = async (
  dialect: IntrospectorDialect,
  connectionString: string,
) => {
  const db = new Kysely<any>({
    dialect: await dialect.createKyselyDialect({ connectionString }),
    plugins: [new CamelCasePlugin()],
  });

  await down(db, dialect);
  await up(db, dialect);

  return db;
};

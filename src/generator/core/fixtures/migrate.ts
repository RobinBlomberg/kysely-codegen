import { CamelCasePlugin, Kysely, sql } from 'kysely';
import type { DialectName } from '../../introspector/index.js';
import { getAdapter } from '../../introspector/index.js';

const down = async (db: Kysely<any>, dialectName: string) => {
  await db.transaction().execute(async (trx) => {
    await trx.schema.dropTable('boolean').ifExists().execute();
    await trx.schema.dropTable('foo_bar').ifExists().execute();

    if (dialectName === 'postgres') {
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
    }
  });
};

const up = async (db: Kysely<any>, dialectName: string) => {
  await db.transaction().execute(async (trx) => {
    if (dialectName === 'postgres') {
      await trx.schema.createSchema('test').ifNotExists().execute();
      await trx.schema
        .withSchema('test')
        .createType('status')
        .asEnum(['FOO', 'BAR'])
        .execute();
      await trx.schema
        .createType('status')
        .asEnum(['CONFIRMED', 'UNCONFIRMED'])
        .execute();

      await sql`CREATE domain pos_int AS Integer CONSTRAINT positive_number CHECK (value >= 0);`.execute(
        trx,
      );
      // Edge case where a domain is a child of another domain
      await sql`CREATE domain pos_int_child as pos_int;`.execute(trx);
      await sql`CREATE domain test.is_bool as boolean;`.execute(trx);
    }

    let builder = trx.schema
      .createTable('foo_bar')
      .addColumn('false', 'boolean', (col) => col.notNull())
      .addColumn('true', 'boolean', (col) => col.notNull());

    if (dialectName === 'mysql') {
      builder = builder
        .addColumn('id', 'serial')
        .addColumn('user_status', sql`enum('CONFIRMED','UNCONFIRMED')`);
    } else if (dialectName === 'postgres') {
      builder = builder
        .addColumn('id', 'serial')
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
        .addColumn('timestamps', sql`timestamp with time zone[]`);
    } else {
      builder = builder
        .addColumn('id', 'integer', (col) =>
          col.autoIncrement().notNull().primaryKey(),
        )
        .addColumn('user_status', 'text');
    }

    await builder.execute();
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
  dialectName: DialectName,
  connectionString: string,
) => {
  const db = new Kysely<any>({
    dialect: await getAdapter(dialectName).createKyselyDialect({
      connectionString,
    }),
    plugins: [new CamelCasePlugin()],
  });

  await down(db, dialectName);
  await up(db, dialectName);

  return db;
};

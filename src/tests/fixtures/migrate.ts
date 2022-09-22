import { Kysely, sql } from 'kysely';
import { Dialect } from '../../dialect';
import { MysqlDialect, PostgresDialect } from '../../dialects';

const down = async (db: Kysely<any>, dialect: Dialect) => {
  await db.schema.dropTable('users').ifExists().execute();

  if (dialect instanceof PostgresDialect) {
    await db.schema.dropType('status').ifExists().execute();
  }
};

const up = async (db: Kysely<any>, dialect: Dialect) => {
  if (dialect instanceof PostgresDialect) {
    await db.schema
      .createType('status')
      .asEnum(['CONFIRMED', 'UNCONFIRMED'])
      .execute();
  }

  let builder = db.schema.createTable('users').addColumn('id', 'serial');

  if (dialect instanceof MysqlDialect) {
    builder = builder.addColumn(
      'user_status',
      sql`enum('CONFIRMED','UNCONFIRMED')`,
    );
  } else if (dialect instanceof PostgresDialect) {
    builder = builder.addColumn('user_status', sql`status`);
  } else {
    builder = builder.addColumn('user_status', 'text');
  }

  await builder.execute();
};

export const migrate = async (dialect: Dialect, connectionString: string) => {
  const db = new Kysely<any>({
    dialect: await dialect.createKyselyDialect({ connectionString }),
  });

  await down(db, dialect);
  await up(db, dialect);

  return db;
};

import { deepStrictEqual as equal } from 'assert';
import type { Kysely } from 'kysely';
import { sql } from 'kysely';
import { afterAll, beforeEach, describe, it } from 'vitest';
import { EnumMap } from '../../enum-map.js';
import { factory } from '../../factory.js';
import { sqliteAdapter } from './sqlite.js';

let db: Kysely<any>;

const resetDatabase = async () => {
  const result: any = await sql`
    select name
    from sqlite_schema
    where type = 'table'
    and name not like 'sqlite_%'
  `.execute(db);

  for (const row of result.rows) {
    await sql`drop table ${sql.raw(row.name)}`.execute(db);
  }
};

beforeEach(async () => {
  db = await sqliteAdapter.connect(':memory:');
  await resetDatabase();
});

afterAll(async () => {
  await resetDatabase();
  await db.destroy();
});

describe('sqlite', () => {
  it('should introspect basic data types correctly', async () => {
    await db.schema
      .createTable('data_types')
      .addColumn('bigint', 'bigint')
      .execute();

    equal(
      await sqliteAdapter.introspect(db),
      factory.createDatabaseSchema({
        enums: new EnumMap(),
        tables: [
          factory.createTableSchema({
            name: 'data_types',
            columns: [
              factory.createColumnSchema({
                name: 'bigint',
                dataType: 'bigint',
                isNullable: true,
              }),
            ],
          }),
        ],
      }),
    );
  });
});

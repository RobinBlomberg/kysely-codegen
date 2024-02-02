import { deepStrictEqual as equal } from 'assert';
import type { Kysely } from 'kysely';
import { sql } from 'kysely';
import { afterAll, beforeEach, describe, it } from 'vitest';
import { factory } from '../../factory.js';
import { libsqlAdapter } from './libsql.js';

let db: Kysely<any>;

const resetDatabase = async () => {
  const result: any = await sql`
    select name
    from sqlite_schema
    where type = 'table'
    and name not like 'libsql_%'
    and name not like 'sqlite_%'
  `.execute(db);

  for (const row of result.rows) {
    await sql`drop table ${sql.raw(row.name)}`.execute(db);
  }
};

beforeEach(async () => {
  db = await libsqlAdapter.connect('libsql://localhost:8080?tls=0');
  await resetDatabase();
});

afterAll(async () => {
  await resetDatabase();
  await db.destroy();
});

describe('libsql', () => {
  it('should introspect basic data types correctly', async () => {
    await db.schema
      .createTable('data_types')
      .addColumn('bigint', 'bigint')
      .execute();

    equal(
      await libsqlAdapter.introspect(db),
      factory.createDatabaseSchema({
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
          factory.createTableSchema({
            name: 'libsql_wasm_func_table',
            columns: [
              factory.createColumnSchema({
                name: 'name',
                dataType: 'TEXT',
              }),
              factory.createColumnSchema({
                name: 'body',
                dataType: 'TEXT',
                isNullable: true,
              }),
            ],
          }),
        ],
      }),
    );
  });
});

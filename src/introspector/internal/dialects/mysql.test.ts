import { deepStrictEqual as equal } from 'assert';
import type { Kysely } from 'kysely';
import { sql } from 'kysely';
import { afterAll, beforeEach, describe, it } from 'vitest';
import { EnumMap } from '../../enum-map.js';
import { factory } from '../../factory.js';
import { mysqlAdapter } from './mysql.js';

const BASE_CONNECTION_STRING = 'mysql://qwe:qwe@localhost';
const DATABASE_NAME = 'qwe';

let db: Kysely<any>;

const resetDatabase = async () => {
  await sql`drop database if exists ${sql.raw(DATABASE_NAME)}`.execute(db);
  await sql`create database ${sql.raw(DATABASE_NAME)}`.execute(db);
};

beforeEach(async () => {
  db = await mysqlAdapter.connect(BASE_CONNECTION_STRING);
  await resetDatabase();
  db = await mysqlAdapter.connect(`${BASE_CONNECTION_STRING}/${DATABASE_NAME}`);
});

afterAll(async () => {
  await resetDatabase();
  await db.destroy();
});

describe('mysql', () => {
  it('should introspect basic data types correctly', async () => {
    await db.schema
      .createTable('data_types')
      .addColumn('bigint', 'bigint')
      .execute();

    equal(
      await mysqlAdapter.introspect(db),
      factory.createDatabaseSchema({
        enums: new EnumMap(),
        tables: [
          factory.createTableSchema({
            schema: 'qwe',
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

  it('should support enums', async () => {
    await db.schema
      .createTable('enums')
      .addColumn('enum', sql`enum('a', 'b', 'c')`, (column) =>
        column.defaultTo('a').notNull(),
      )
      .execute();

    equal(
      await mysqlAdapter.introspect(db),
      factory.createDatabaseSchema({
        tables: [
          factory.createTableSchema({
            schema: 'qwe',
            name: 'enums',
            columns: [
              factory.createColumnSchema({
                name: 'enum',
                dataType: 'enum',
                enumValues: ['a', 'b', 'c'],
                hasDefaultValue: true,
              }),
            ],
          }),
        ],
      }),
    );
  });
});

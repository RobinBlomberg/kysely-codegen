import { deepStrictEqual as equal } from 'assert';
import type { Kysely } from 'kysely';
import { sql } from 'kysely';
import { afterAll, beforeEach, describe, it } from 'vitest';
import { EnumMap } from '../../enum-map.js';
import { factory } from '../../factory.js';
import { postgresAdapter } from './postgres.js';

let db: Kysely<any>;

const resetDatabase = async () => {
  await db.schema.dropSchema('public').ifExists().cascade().execute();
  await db.schema.createSchema('public').execute();
};

beforeEach(async () => {
  db = await postgresAdapter.connect('postgres://qwe:qwe@localhost:5433/qwe');
  await resetDatabase();
});

afterAll(async () => {
  await resetDatabase();
  await db.destroy();
});

describe('postgres', () => {
  it('should introspect basic data types correctly', async () => {
    await db.schema
      .createTable('data_types')
      .addColumn('bigint', 'bigint')
      .execute();

    equal(
      await postgresAdapter.introspect(db),
      factory.createDatabaseSchema({
        enums: new EnumMap(),
        tables: [
          factory.createTableSchema({
            schema: 'public',
            name: 'data_types',
            columns: [
              factory.createColumnSchema({
                name: 'bigint',
                dataType: 'int8',
                dataTypeSchema: 'pg_catalog',
                isNullable: true,
              }),
            ],
          }),
        ],
      }),
    );
  });

  it('should support checks', async () => {
    await db.schema
      .createTable('checks')
      .addColumn('check', sql`text check ("check" IN ('a', 'b'))`)
      .execute();

    equal(
      await postgresAdapter.introspect(db),
      factory.createDatabaseSchema({
        tables: [
          factory.createTableSchema({
            schema: 'public',
            name: 'checks',
            columns: [
              factory.createColumnSchema({
                name: 'check',
                dataTypeSchema: 'pg_catalog',
                dataType: 'text',
                enumValues: ['a', 'b'],
                isNullable: true,
              }),
            ],
          }),
        ],
      }),
    );
  });

  it('should support enums', async () => {
    await db.schema.createType('enum').asEnum(['a', 'b']).execute();

    await db.schema
      .createTable('enums')
      .addColumn('enum', sql`enum`, (column) => column.defaultTo('a').notNull())
      .execute();

    equal(
      await postgresAdapter.introspect(db),
      factory.createDatabaseSchema({
        enums: new EnumMap({
          'public.enum': ['a', 'b'],
        }),
        tables: [
          factory.createTableSchema({
            schema: 'public',
            name: 'enums',
            columns: [
              factory.createColumnSchema({
                name: 'enum',
                dataTypeSchema: 'public',
                dataType: 'enum',
                enumValues: ['a', 'b'],
                hasDefaultValue: true,
              }),
            ],
          }),
        ],
      }),
    );
  });

  it('should support filtering', async () => {
    await db.schema
      .createTable('table1')
      .addColumn('bigint', 'bigint')
      .execute();
    await db.schema
      .createTable('table2')
      .addColumn('bigint', 'bigint')
      .execute();
    await db.schema
      .createTable('table3')
      .addColumn('bigint', 'bigint')
      .execute();

    equal(
      await postgresAdapter.introspect(db, {
        includePattern: 'table(1|3)',
        excludePattern: 'table3',
      }),
      factory.createDatabaseSchema({
        tables: [
          factory.createTableSchema({
            schema: 'public',
            name: 'table1',
            columns: [
              factory.createColumnSchema({
                name: 'bigint',
                dataType: 'int8',
                dataTypeSchema: 'pg_catalog',
                isNullable: true,
              }),
            ],
          }),
        ],
      }),
    );
  });

  it('should support views', async () => {
    await db.schema
      .createView('view')
      .as(sql`SELECT 1 AS "a"`)
      .execute();

    equal(
      await postgresAdapter.introspect(db),
      factory.createDatabaseSchema({
        tables: [
          factory.createTableSchema({
            schema: 'public',
            name: 'view',
            isView: true,
            columns: [
              factory.createColumnSchema({
                name: 'a',
                dataTypeSchema: 'pg_catalog',
                dataType: 'int4',
                isNullable: true,
              }),
            ],
          }),
        ],
      }),
    );
  });
});

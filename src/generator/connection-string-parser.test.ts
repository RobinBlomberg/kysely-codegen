import { deepStrictEqual } from 'assert';
import { describe, it } from 'vitest';
import { ConnectionStringParser } from './connection-string-parser';

describe(ConnectionStringParser.name, () => {
  const parser = new ConnectionStringParser();

  describe('postgres', () => {
    it('should infer the correct dialect name', () => {
      deepStrictEqual(
        parser.parse({
          connectionString: 'postgres://username:password@hostname/database',
        }),
        {
          connectionString: 'postgres://username:password@hostname/database',
          dialectName: 'postgres',
        },
      );
      deepStrictEqual(
        parser.parse({
          connectionString: 'postgresql://username:password@hostname/database',
        }),
        {
          connectionString: 'postgresql://username:password@hostname/database',
          dialectName: 'postgres',
        },
      );
      deepStrictEqual(
        parser.parse({
          connectionString: 'pg://username:password@hostname/database',
        }),
        {
          connectionString: 'postgres://username:password@hostname/database',
          dialectName: 'postgres',
        },
      );
    });
  });

  describe('mysql', () => {
    it('should infer the correct dialect name', () => {
      deepStrictEqual(
        parser.parse({
          connectionString: 'mysql://username:password@hostname/database',
        }),
        {
          connectionString: 'mysql://username:password@hostname/database',
          dialectName: 'mysql',
        },
      );
      deepStrictEqual(
        parser.parse({
          connectionString: 'mysqlx://username:password@hostname/database',
        }),
        {
          connectionString: 'mysqlx://username:password@hostname/database',
          dialectName: 'mysql',
        },
      );
    });
  });

  describe('sqlite', () => {
    it('should infer the correct dialect name', () => {
      deepStrictEqual(
        parser.parse({
          connectionString: 'C:/Program Files/sqlite3/db',
        }),
        {
          connectionString: 'C:/Program Files/sqlite3/db',
          dialectName: 'sqlite',
        },
      );
      deepStrictEqual(
        parser.parse({
          connectionString: '/usr/local/bin',
        }),
        {
          connectionString: '/usr/local/bin',
          dialectName: 'sqlite',
        },
      );
    });
  });

  describe('libsql', () => {
    it('should infer the correct dialect name', () => {
      deepStrictEqual(
        parser.parse({
          connectionString: 'libsql://token@hostname:port/db',
        }),
        {
          connectionString: 'libsql://token@hostname:port/db',
          dialectName: 'libsql',
        },
      );
      deepStrictEqual(
        parser.parse({
          connectionString: 'libsql://hostname:port/db',
        }),
        {
          connectionString: 'libsql://hostname:port/db',
          dialectName: 'libsql',
        },
      );
    });
  });
});

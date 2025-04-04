import { deepStrictEqual } from 'assert';
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
          dialect: 'postgres',
        },
      );
      deepStrictEqual(
        parser.parse({
          connectionString: 'postgresql://username:password@hostname/database',
        }),
        {
          connectionString: 'postgresql://username:password@hostname/database',
          dialect: 'postgres',
        },
      );
      deepStrictEqual(
        parser.parse({
          connectionString: 'pg://username:password@hostname/database',
        }),
        {
          connectionString: 'postgres://username:password@hostname/database',
          dialect: 'postgres',
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
          dialect: 'mysql',
        },
      );
      deepStrictEqual(
        parser.parse({
          connectionString: 'mysqlx://username:password@hostname/database',
        }),
        {
          connectionString: 'mysqlx://username:password@hostname/database',
          dialect: 'mysql',
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
          dialect: 'sqlite',
        },
      );
      deepStrictEqual(
        parser.parse({
          connectionString: '/usr/local/bin',
        }),
        {
          connectionString: '/usr/local/bin',
          dialect: 'sqlite',
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
          dialect: 'libsql',
        },
      );
      deepStrictEqual(
        parser.parse({
          connectionString: 'libsql://hostname:port/db',
        }),
        {
          connectionString: 'libsql://hostname:port/db',
          dialect: 'libsql',
        },
      );
    });
  });
});

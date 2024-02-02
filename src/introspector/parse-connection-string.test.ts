import { deepStrictEqual } from 'assert';
import { describe, it } from 'vitest';
import { parseConnectionString } from './parse-connection-string.js';

describe('libsql', () => {
  it('should infer the correct dialect name', () => {
    deepStrictEqual(
      parseConnectionString({
        connectionString: 'libsql://token@hostname:port/db',
      }),
      {
        connectionString: 'libsql://token@hostname:port/db',
        inferredDialectName: 'libsql',
      },
    );
    deepStrictEqual(
      parseConnectionString({
        connectionString: 'libsql://hostname:port/db',
      }),
      {
        connectionString: 'libsql://hostname:port/db',
        inferredDialectName: 'libsql',
      },
    );
  });
});

describe('mysql', () => {
  it('should infer the correct dialect name', () => {
    deepStrictEqual(
      parseConnectionString({
        connectionString: 'mysql://username:password@hostname/database',
      }),
      {
        connectionString: 'mysql://username:password@hostname/database',
        inferredDialectName: 'mysql',
      },
    );
    deepStrictEqual(
      parseConnectionString({
        connectionString: 'mysqlx://username:password@hostname/database',
      }),
      {
        connectionString: 'mysqlx://username:password@hostname/database',
        inferredDialectName: 'mysql',
      },
    );
  });
});

describe('postgres', () => {
  it('should infer the correct dialect name', () => {
    deepStrictEqual(
      parseConnectionString({
        connectionString: 'postgres://username:password@hostname/database',
      }),
      {
        connectionString: 'postgres://username:password@hostname/database',
        inferredDialectName: 'postgres',
      },
    );
    deepStrictEqual(
      parseConnectionString({
        connectionString: 'postgresql://username:password@hostname/database',
      }),
      {
        connectionString: 'postgresql://username:password@hostname/database',
        inferredDialectName: 'postgres',
      },
    );
    deepStrictEqual(
      parseConnectionString({
        connectionString: 'pg://username:password@hostname/database',
      }),
      {
        connectionString: 'postgres://username:password@hostname/database',
        inferredDialectName: 'postgres',
      },
    );
  });
});

describe('sqlite', () => {
  it('should infer the correct dialect name', () => {
    deepStrictEqual(
      parseConnectionString({
        connectionString: 'C:/Program Files/sqlite3/db',
      }),
      {
        connectionString: 'C:/Program Files/sqlite3/db',
        inferredDialectName: 'sqlite',
      },
    );
    deepStrictEqual(
      parseConnectionString({
        connectionString: '/usr/local/bin',
      }),
      {
        connectionString: '/usr/local/bin',
        inferredDialectName: 'sqlite',
      },
    );
  });
});

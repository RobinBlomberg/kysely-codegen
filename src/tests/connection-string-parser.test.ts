import { deepStrictEqual } from 'assert';
import { ConnectionStringParser } from '../connection-string-parser';
import { describe, it } from './test.utils';

export const testConnectionStringParser = () => {
  const parser = new ConnectionStringParser();

  void describe('connection-string-parser', () => {
    void describe('postgres', () => {
      void it('should infer the correct dialect name', () => {
        deepStrictEqual(
          parser.parse({
            connectionString: 'postgres://username:password@hostname/database',
          }),
          {
            connectionString: 'postgres://username:password@hostname/database',
            inferredDialectName: 'postgres',
          },
        );
      });
    });

    void describe('mysql', () => {
      void it('should infer the correct dialect name', () => {
        deepStrictEqual(
          parser.parse({
            connectionString: 'mysql://username:password@hostname/database',
          }),
          {
            connectionString: 'mysql://username:password@hostname/database',
            inferredDialectName: 'mysql',
          },
        );
        deepStrictEqual(
          parser.parse({
            connectionString: 'mysqlx://username:password@hostname/database',
          }),
          {
            connectionString: 'mysqlx://username:password@hostname/database',
            inferredDialectName: 'mysql',
          },
        );
      });
    });

    void describe('sqlite', () => {
      void it('should infer the correct dialect name', () => {
        deepStrictEqual(
          parser.parse({
            connectionString: 'C:/Program Files/sqlite3/db',
          }),
          {
            connectionString: 'C:/Program Files/sqlite3/db',
            inferredDialectName: 'sqlite',
          },
        );
        deepStrictEqual(
          parser.parse({
            connectionString: '/usr/local/bin',
          }),
          {
            connectionString: '/usr/local/bin',
            inferredDialectName: 'sqlite',
          },
        );
      });
    });
  });
};

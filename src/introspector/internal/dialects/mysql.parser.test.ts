import { deepStrictEqual as equal } from 'assert';
import { describe, test } from 'vitest';
import { MysqlParser } from './mysql.parser.js';

describe('MysqlParser', () => {
  test('enums', () => {
    equal(MysqlParser.parseEnum("ENUM('a', 'b')"), ['a', 'b']);
  });
});

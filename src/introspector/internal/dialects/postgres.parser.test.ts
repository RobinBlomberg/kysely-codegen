import { deepStrictEqual as equal } from 'assert';
import { describe, test } from 'vitest';
import { PostgresParser } from './postgres.parser.js';

describe('PostgresParser', () => {
  test('enum checks', () => {
    equal(
      PostgresParser.parseEnumCheck(
        "CHECK ((\"check\" = ANY (ARRAY['a'::text, 'b'::text])))",
      ),
      ['a', 'b'],
    );
    equal(
      PostgresParser.parseEnumCheck(
        "CHECK ((\"check\" = ANY (ARRAY['a'::character varying, 'b'::character varying])))",
      ),
      ['a', 'b'],
    );
  });
});

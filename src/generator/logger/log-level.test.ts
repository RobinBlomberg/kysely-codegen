import { expect, test } from 'vitest';
import type { LogLevel } from './log-level';
import { getLogLevelNumber, matchLogLevel } from './log-level';

test(getLogLevelNumber.name, () => {
  expect(getLogLevelNumber('invalid' as LogLevel)).toStrictEqual(-1);
  expect(getLogLevelNumber('silent')).toStrictEqual(0);
  expect(getLogLevelNumber('error')).toStrictEqual(1);
  expect(getLogLevelNumber('warn')).toStrictEqual(2);
  expect(getLogLevelNumber('info')).toStrictEqual(3);
  expect(getLogLevelNumber('debug')).toStrictEqual(4);
});

test(matchLogLevel.name, () => {
  expect(matchLogLevel({ actual: 'error', expected: 'error' })).toStrictEqual(
    true,
  );
  expect(matchLogLevel({ actual: 'error', expected: 'warn' })).toStrictEqual(
    false,
  );
  expect(matchLogLevel({ actual: 'warn', expected: 'error' })).toStrictEqual(
    true,
  );
  expect(matchLogLevel({ actual: 'warn', expected: 'warn' })).toStrictEqual(
    true,
  );
  expect(matchLogLevel({ actual: 'warn', expected: 'info' })).toStrictEqual(
    false,
  );
  expect(matchLogLevel({ actual: 'debug', expected: 'error' })).toStrictEqual(
    true,
  );
  expect(matchLogLevel({ actual: 'debug', expected: 'info' })).toStrictEqual(
    true,
  );
  expect(matchLogLevel({ actual: 'debug', expected: 'debug' })).toStrictEqual(
    true,
  );
});

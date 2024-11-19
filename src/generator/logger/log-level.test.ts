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
  expect(matchLogLevel('error').isSupersetOf('error')).toStrictEqual(true);
  expect(matchLogLevel('error').isSupersetOf('warn')).toStrictEqual(false);
  expect(matchLogLevel('warn').isSupersetOf('error')).toStrictEqual(true);
  expect(matchLogLevel('warn').isSupersetOf('warn')).toStrictEqual(true);
  expect(matchLogLevel('warn').isSupersetOf('info')).toStrictEqual(false);
  expect(matchLogLevel('debug').isSupersetOf('error')).toStrictEqual(true);
  expect(matchLogLevel('debug').isSupersetOf('info')).toStrictEqual(true);
  expect(matchLogLevel('debug').isSupersetOf('debug')).toStrictEqual(true);
});

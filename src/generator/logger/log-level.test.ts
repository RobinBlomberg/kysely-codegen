import { getLogLevelNumber, LogLevel, matchesLogLevel } from './log-level';

test(getLogLevelNumber.name, () => {
  expect(getLogLevelNumber(LogLevel.SILENT)).toStrictEqual(0);
  expect(getLogLevelNumber(LogLevel.INFO)).toStrictEqual(1);
  expect(getLogLevelNumber(LogLevel.WARN)).toStrictEqual(2);
  expect(getLogLevelNumber(LogLevel.ERROR)).toStrictEqual(3);
  expect(getLogLevelNumber(LogLevel.DEBUG)).toStrictEqual(4);

  expect(getLogLevelNumber('silent' as LogLevel)).toStrictEqual(0);
  expect(getLogLevelNumber('info' as LogLevel)).toStrictEqual(1);
  expect(getLogLevelNumber('warn' as LogLevel)).toStrictEqual(2);
  expect(getLogLevelNumber('error' as LogLevel)).toStrictEqual(3);
  expect(getLogLevelNumber('debug' as LogLevel)).toStrictEqual(4);

  expect(getLogLevelNumber('invalid' as LogLevel)).toStrictEqual(-1);
});

test(matchesLogLevel.name, () => {
  expect(matchesLogLevel(LogLevel.SILENT, LogLevel.SILENT)).toStrictEqual(true);
  expect(matchesLogLevel(LogLevel.SILENT, LogLevel.INFO)).toStrictEqual(false);
  expect(matchesLogLevel(LogLevel.INFO, LogLevel.SILENT)).toStrictEqual(true);
  expect(matchesLogLevel(LogLevel.INFO, LogLevel.INFO)).toStrictEqual(true);
});

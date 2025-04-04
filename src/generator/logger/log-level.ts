export type LogLevel = (typeof LOG_LEVELS)[number];

export const DEFAULT_LOG_LEVEL: LogLevel = 'warn';

export const LOG_LEVELS = ['silent', 'error', 'warn', 'info', 'debug'] as const;

export const getLogLevelNumber = (logLevel: LogLevel) => {
  return ['silent', 'error', 'warn', 'info', 'debug'].indexOf(logLevel);
};

export const matchLogLevel = ({
  actual,
  expected,
}: {
  actual: LogLevel;
  expected: LogLevel;
}) => {
  return getLogLevelNumber(actual) >= getLogLevelNumber(expected);
};

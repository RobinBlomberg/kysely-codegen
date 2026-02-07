export type LogLevel = (typeof LOG_LEVELS)[number];

export const DEFAULT_LOG_LEVEL: LogLevel = 'warn';

export const LOG_LEVELS = ['silent', 'error', 'warn', 'info', 'debug'] as const;

export const getLogLevelNumber = (logLevel: LogLevel) => {
  return LOG_LEVELS.indexOf(logLevel);
};

export const isValidLogLevel = (logLevel: unknown): logLevel is LogLevel => {
  return getLogLevelNumber(logLevel as LogLevel) !== -1;
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

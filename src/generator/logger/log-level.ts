export enum LogLevel {
  SILENT = 'silent',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
}

export const getLogLevelNumber = (logLevel: LogLevel) => {
  return [
    LogLevel.SILENT,
    LogLevel.INFO,
    LogLevel.WARN,
    LogLevel.ERROR,
    LogLevel.DEBUG,
  ].indexOf(logLevel);
};

export const matchesLogLevel = (
  logLevel: LogLevel,
  logLevelToMatch: LogLevel,
) => {
  return getLogLevelNumber(logLevel) >= getLogLevelNumber(logLevelToMatch);
};

export const enum LogLevel {
  SILENT,
  INFO,
  WARN,
  ERROR,
  DEBUG,
}

export const getLogLevel = (
  name?: 'silent' | 'info' | 'warn' | 'error' | 'debug',
) => {
  switch (name) {
    case 'silent':
      return LogLevel.SILENT;
    case 'info':
      return LogLevel.INFO;
    case 'error':
      return LogLevel.ERROR;
    case 'debug':
      return LogLevel.DEBUG;
    default:
      return LogLevel.WARN;
  }
};

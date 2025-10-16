export type LogLevel = (typeof LOG_LEVELS)[number];
export declare const DEFAULT_LOG_LEVEL: LogLevel;
export declare const LOG_LEVELS: readonly ["silent", "error", "warn", "info", "debug"];
export declare const getLogLevelNumber: (logLevel: LogLevel) => number;
export declare const matchLogLevel: ({ actual, expected, }: {
    actual: LogLevel;
    expected: LogLevel;
}) => boolean;

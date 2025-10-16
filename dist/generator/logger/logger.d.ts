import type { LogLevel } from './log-level';
export declare class Logger {
    #private;
    readonly logLevel: LogLevel;
    constructor(logLevel?: LogLevel);
    debug(...values: unknown[]): void;
    error(...values: unknown[]): void;
    info(...values: unknown[]): void;
    log(...values: unknown[]): void;
    success(...values: unknown[]): void;
    warn(...values: unknown[]): void;
}

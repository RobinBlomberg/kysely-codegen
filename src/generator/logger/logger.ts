import chalk from 'chalk';
import { inspect } from 'util';
import { LogLevel } from './log-level';

/**
 * Provides pretty console logging.
 */
export class Logger {
  readonly logLevel: LogLevel;

  constructor(logLevel: LogLevel = LogLevel.INFO) {
    this.logLevel = logLevel;
  }

  #inspect(values: unknown[]) {
    return values
      .map((value) => {
        return value instanceof Object
          ? inspect(value, { colors: true })
          : value;
      })
      .join(' ');
  }

  debug(...values: unknown[]) {
    if (this.logLevel >= LogLevel.DEBUG) {
      console.debug(...values.map((value) => this.serializeDebug(value)));
    }
  }

  error(...values: unknown[]) {
    if (this.logLevel >= LogLevel.ERROR) {
      console.error(...values.map((value) => this.serializeError(value)));
    }
  }

  info(...values: unknown[]) {
    if (this.logLevel >= LogLevel.INFO) {
      console.info(...values.map((value) => this.serializeInfo(value)));
    }
  }

  log(...values: unknown[]) {
    if (this.logLevel >= LogLevel.INFO) {
      console.log(...values);
    }
  }

  serializeDebug(...values: unknown[]) {
    return chalk.gray(`  ${this.#inspect(values)}`);
  }

  serializeError(...values: unknown[]) {
    return chalk.red(`✗ ${this.#inspect(values)}`);
  }

  serializeInfo(...values: unknown[]) {
    return chalk.blue(`• ${this.#inspect(values)}`);
  }

  serializeSuccess(...values: unknown[]) {
    return chalk.green(`✓ ${this.#inspect(values)}`);
  }

  serializeWarn(...values: unknown[]) {
    return chalk.yellow(`⚠ ${this.#inspect(values)}`);
  }

  success(...values: unknown[]) {
    if (this.logLevel >= LogLevel.INFO) {
      console.log(...values.map((value) => this.serializeSuccess(value)));
    }
  }

  warn(...values: unknown[]) {
    if (this.logLevel >= LogLevel.WARN) {
      console.warn(...values.map((value) => this.serializeWarn(value)));
    }
  }
}

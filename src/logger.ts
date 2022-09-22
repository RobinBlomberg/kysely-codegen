import chalk from 'chalk';
import { inspect } from 'util';
import { LogLevel } from './enums';

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
      for (const value of values) {
        console.debug(this.serializeDebug(value));
      }
    }
  }

  error(...values: unknown[]) {
    if (this.logLevel >= LogLevel.ERROR) {
      for (const value of values) {
        console.error(this.serializeError(value));
      }
    }
  }

  info(...values: unknown[]) {
    if (this.logLevel >= LogLevel.INFO) {
      for (const value of values) {
        console.info(this.serializeInfo(value));
      }
    }
  }

  log(...values: unknown[]) {
    if (this.logLevel >= LogLevel.INFO) {
      for (const value of values) {
        console.log(value);
      }
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
      for (const value of values) {
        console.log(this.serializeSuccess(value));
      }
    }
  }

  warn(...values: unknown[]) {
    if (this.logLevel >= LogLevel.WARN) {
      for (const value of values) {
        console.warn(this.serializeWarn(value));
      }
    }
  }
}

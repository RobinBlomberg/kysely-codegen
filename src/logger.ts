import chalk from 'chalk';
import { inspect } from 'util';
import { LogLevel } from './enums/log-level';

export class Logger {
  readonly logLevel: LogLevel;

  constructor(logLevel: LogLevel) {
    this.logLevel = logLevel;
  }

  private inspect(values: unknown[]) {
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
      console.debug(this.serializeDebug(...values));
    }
  }

  error(...values: unknown[]) {
    if (this.logLevel >= LogLevel.ERROR) {
      console.error(this.serializeError(...values));
    }
  }

  info(...values: unknown[]) {
    if (this.logLevel >= LogLevel.INFO) {
      console.info(this.serializeInfo(...values));
    }
  }

  log(...values: unknown[]) {
    if (this.logLevel >= LogLevel.INFO) {
      console.log(...values);
    }
  }

  serializeDebug(...values: unknown[]) {
    return chalk.gray(`  ${this.inspect(values)}`);
  }

  serializeError(...values: unknown[]) {
    return chalk.red(`✗ ${this.inspect(values)}`);
  }

  serializeInfo(...values: unknown[]) {
    return chalk.blue(`• ${this.inspect(values)}`);
  }

  serializeSuccess(...values: unknown[]) {
    return chalk.green(`✓ ${this.inspect(values)}`);
  }

  serializeWarn(...values: unknown[]) {
    return chalk.yellow(`⚠ ${this.inspect(values)}`);
  }

  success(...values: unknown[]) {
    if (this.logLevel >= LogLevel.INFO) {
      console.log(this.serializeSuccess(...values));
    }
  }

  warn(...values: unknown[]) {
    if (this.logLevel >= LogLevel.WARN) {
      console.warn(this.serializeWarn(...values));
    }
  }
}

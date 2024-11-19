import chalk from 'chalk';
import { inspect } from 'util';
import type { LogLevel } from './log-level';
import { matchLogLevel } from './log-level';

export class Logger {
  readonly logLevel: LogLevel;

  constructor(logLevel: LogLevel = 'info') {
    this.logLevel = logLevel;
  }

  #log(
    consoleMethod: 'debug' | 'error' | 'info' | 'log' | 'warn',
    color: 'blue' | 'gray' | 'green' | 'red' | 'yellow' | null,
    icon: string | null,
    values: unknown[],
  ) {
    const texts = [...(icon === null ? [] : [icon]), ...values];
    return console[consoleMethod](
      ...texts.map((value) => {
        const text = (
          typeof value === 'string' ? value : inspect(value, { colors: true })
        ).replaceAll(/(\r?\n)/g, icon === null ? '$1' : '$1  ');
        return color ? chalk[color](text) : text;
      }),
    );
  }

  #shouldLog(messageLogLevel: LogLevel) {
    return matchLogLevel(this.logLevel).isSupersetOf(messageLogLevel);
  }

  debug(...values: unknown[]) {
    if (this.#shouldLog('debug')) {
      this.#log('debug', 'gray', null, values);
    }
  }

  error(...values: unknown[]) {
    if (this.#shouldLog('error')) {
      this.#log('error', 'red', '✗', values);
    }
  }

  info(...values: unknown[]) {
    if (this.#shouldLog('info')) {
      this.#log('info', 'blue', '•', values);
    }
  }

  log(...values: unknown[]) {
    if (this.#shouldLog('info')) {
      console.log(...values);
    }
  }

  success(...values: unknown[]) {
    if (this.#shouldLog('info')) {
      this.#log('log', 'green', '✓', values);
    }
  }

  warn(...values: unknown[]) {
    if (this.#shouldLog('warn')) {
      this.#log('warn', 'yellow', '⚠', values);
    }
  }
}

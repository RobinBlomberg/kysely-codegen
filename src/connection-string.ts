import { config as loadEnv } from 'dotenv';
import { Logger } from './logger';

const CALL_STATEMENT_REGEXP = /^\s*([a-z]+)\s*\(\s*(.*)\s*\)\s*$/;

export class CodegenConnectionStringParser {
  readonly logger: Logger;
  readonly url: string;

  constructor(options: { logger: Logger; url: string }) {
    this.logger = options.logger;
    this.url = options.url;
  }

  parseConnectionString() {
    const expressionMatch = this.url.match(CALL_STATEMENT_REGEXP);

    if (expressionMatch) {
      const name = expressionMatch[1]!;

      if (name !== 'env') {
        throw new ReferenceError(`Function '${name}' is not defined.`);
      }

      const keyToken = expressionMatch[2]!;
      let key;

      try {
        key = keyToken.includes('"') ? JSON.parse(keyToken) : keyToken;
      } catch {
        throw new SyntaxError(`Invalid URL: '${this.url}'`);
      }

      if (typeof key !== 'string') {
        throw new TypeError(
          `Parameter 0 of function '${name}' must be a string.`,
        );
      }

      loadEnv();

      this.logger.info('Loaded environment variables from .env file.');

      const connectionString = process.env[key];

      if (!connectionString) {
        throw new ReferenceError(
          `Environment variable '${key}' could not be found.`,
        );
      }

      return connectionString;
    }

    try {
      void new URL(this.url);
    } catch {
      throw new SyntaxError(`Invalid URL: '${this.url}'`);
    }

    return this.url;
  }
}

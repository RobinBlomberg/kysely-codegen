import { config as loadEnv } from 'dotenv';
import { CodegenDialectName } from './dialect-manager';
import { Logger } from './logger';

const CALL_STATEMENT_REGEXP = /^\s*([a-z]+)\s*\(\s*(.*)\s*\)\s*$/;

export type ParseConnectionStringResult = {
  connectionString: string;
  dialectName: CodegenDialectName;
};

export class CodegenConnectionStringParser {
  readonly logger: Logger;
  readonly url: string;

  constructor(options: { logger: Logger; url: string }) {
    this.logger = options.logger;
    this.url = options.url;
  }

  parseConnectionString(): ParseConnectionStringResult {
    let connectionString = this.url;

    const expressionMatch = connectionString.match(CALL_STATEMENT_REGEXP);
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
        throw new SyntaxError(
          `Invalid connection string: '${connectionString}'`,
        );
      }

      if (typeof key !== 'string') {
        throw new TypeError(
          `Parameter 0 of function '${name}' must be a string.`,
        );
      }

      loadEnv();

      this.logger.info('Loaded environment variables from .env file.');

      const envConnectionString = process.env[key];
      if (!envConnectionString) {
        throw new ReferenceError(
          `Environment variable '${key}' could not be found.`,
        );
      }

      connectionString = envConnectionString;
    }

    try {
      void new URL(connectionString);
    } catch {
      throw new SyntaxError(`Invalid URL: '${connectionString}'`);
    }

    return {
      connectionString,
      dialectName: connectionString.startsWith('postgres://')
        ? 'postgres'
        : 'sqlite',
    };
  }
}

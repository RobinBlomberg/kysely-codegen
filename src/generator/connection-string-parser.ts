import { config as loadEnv } from 'dotenv';
import { expand as expandEnv } from 'dotenv-expand';
import type { DialectName } from './dialect-manager';
import type { Logger } from './logger';

const CALL_STATEMENT_REGEXP = /^\s*([a-z]+)\s*\(\s*(.*)\s*\)\s*$/;
const DIALECT_PARTS_REGEXP = /([^:]*)(.*)/;

/**
 * @see https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html
 */
export type ParseConnectionStringOptions = {
  connectionString: string;
  dialectName?: DialectName;
  envFile?: string;
  logger?: Logger;
};

export type ParsedConnectionString = {
  connectionString: string;
  inferredDialectName: DialectName;
};

/**
 * Parses a connection string URL or loads it from an environment file.
 * Upon success, it also returns which dialect was inferred from the connection string.
 */
export class ConnectionStringParser {
  #inferDialectName(connectionString: string): DialectName {
    if (connectionString.startsWith('libsql')) {
      return 'libsql';
    }

    if (connectionString.startsWith('mysql')) {
      return 'mysql';
    }

    if (
      connectionString.startsWith('postgres') ||
      connectionString.startsWith('pg')
    ) {
      return 'postgres';
    }

    if (connectionString.toLowerCase().includes('user id=')) {
      return 'mssql';
    }

    return 'sqlite';
  }

  parse(options: ParseConnectionStringOptions): ParsedConnectionString {
    let connectionString = options.connectionString;

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

      expandEnv(loadEnv({ path: options.envFile }));

      options.logger?.info('Loaded environment variables from .env file.');

      const envConnectionString = process.env[key];
      if (!envConnectionString) {
        throw new ReferenceError(
          `Environment variable '${key}' could not be found.`,
        );
      }

      connectionString = envConnectionString;
    }

    const parts = connectionString.match(DIALECT_PARTS_REGEXP)!;
    const protocol = parts[1]!;
    const tail = parts[2]!;
    const normalizedConnectionString =
      protocol === 'pg' ? `postgres${tail}` : connectionString;

    const inferredDialectName =
      options.dialectName ?? this.#inferDialectName(connectionString);

    return {
      connectionString: normalizedConnectionString,
      inferredDialectName,
    };
  }
}

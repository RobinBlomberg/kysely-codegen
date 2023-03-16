import { config as loadEnv } from 'dotenv';
import { DialectName } from './dialect-manager';
import { Logger } from './logger';

const CALL_STATEMENT_REGEXP = /^\s*([a-z]+)\s*\(\s*(.*)\s*\)\s*$/;

/**
 * @see https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html
 */
const MYSQL_URI_CONNECTION_STRING_REGEXP = /^mysqlx?:\/\//;

export type ParseConnectionStringOptions = {
  connectionString: string;
  dialectName?: DialectName;
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
    if (connectionString.startsWith('postgres://')) {
      return 'postgres';
    }

    if (MYSQL_URI_CONNECTION_STRING_REGEXP.test(connectionString)) {
      return 'mysql';
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

      loadEnv();

      options.logger?.info('Loaded environment variables from .env file.');

      const envConnectionString = process.env[key];
      if (!envConnectionString) {
        throw new ReferenceError(
          `Environment variable '${key}' could not be found.`,
        );
      }

      connectionString = envConnectionString;
    }

    const inferredDialectName =
      options.dialectName ?? this.#inferDialectName(connectionString);

    return {
      connectionString,
      inferredDialectName,
    };
  }
}

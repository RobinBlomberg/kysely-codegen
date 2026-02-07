import { config as loadEnv } from 'dotenv';
import { expand as expandEnv } from 'dotenv-expand';
import type { DialectName } from '../config/config';
import type { Logger } from './logger/logger';

const CALL_STATEMENT_REGEXP = /^\s*([a-z]+)\s*\(\s*(.*)\s*\)\s*$/;
const DIALECT_PARTS_REGEXP = /([^:]*)(.*)/;

/**
 * @see https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html
 */
type ParseConnectionStringOptions = {
  connectionString: string;
  dialect?: DialectName;
  envFile?: string;
  logger?: Logger;
};

type ParsedConnectionString = {
  connectionString: string;
  dialect: DialectName;
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
      let key: string | undefined;

      try {
        key = keyToken.includes('"') ? JSON.parse(keyToken) : keyToken;
      } catch {
        throw new SyntaxError(
          `Invalid connection string: '${connectionString}'`,
        );
      }

      if (typeof key !== 'string') {
        throw new TypeError(
          `Argument 0 of function '${name}' must be a string.`,
        );
      }

      const { error } = expandEnv(loadEnv({ path: options.envFile }));
      const displayEnvFile = options.envFile ?? '.env';

      if (error) {
        if (
          'code' in error &&
          typeof error.code === 'string' &&
          error.code === 'ENOENT'
        ) {
          if (options.envFile !== undefined) {
            throw new ReferenceError(
              `Could not resolve connection string '${connectionString}'. ` +
                `Environment file '${displayEnvFile}' could not be found. ` +
                "Use '--env-file' to specify a different file.",
            );
          }
        } else {
          throw error;
        }
      } else {
        options.logger?.info(
          `Loaded environment variables from '${displayEnvFile}'.`,
        );
      }

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
      protocol === 'pg'
        ? `postgres${tail}`
        : protocol === 'sqlite'
          ? tail.replace(/^:\/\//, '')
          : connectionString;

    const dialect =
      options.dialect ?? this.#inferDialectName(normalizedConnectionString);

    return {
      connectionString: normalizedConnectionString,
      dialect,
    };
  }
}

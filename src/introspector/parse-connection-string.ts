import { config as loadEnv } from 'dotenv';
import type { DialectName } from './types.js';

/**
 * @see https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html
 */
export type ParseConnectionStringOptions = {
  connectionString: string;
  dialectName?: DialectName;
  envFile?: string;
};

export type ParsedConnectionString = {
  connectionString: string;
  inferredDialectName: DialectName;
};

const CALL_STATEMENT_REGEXP = /^\s*([a-z]+)\s*\(\s*(.*)\s*\)\s*$/;
const DIALECT_PARTS_REGEXP = /([^:]*)(.*)/;

export const inferDialectName = (connectionString: string): DialectName => {
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

  return 'sqlite';
};

export const parseConnectionString = (
  options: ParseConnectionStringOptions,
): ParsedConnectionString => {
  let inputConnectionString = options.connectionString;

  const expressionMatch = inputConnectionString.match(CALL_STATEMENT_REGEXP);

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
        `Invalid connection string: '${inputConnectionString}'`,
      );
    }

    if (typeof key !== 'string') {
      throw new TypeError(
        `Parameter 0 of function '${name}' must be a string.`,
      );
    }

    loadEnv({ path: options.envFile });

    const envConnectionString = process.env[key];
    if (!envConnectionString) {
      throw new ReferenceError(
        `Environment variable '${key}' could not be found.`,
      );
    }

    inputConnectionString = envConnectionString;
  }

  const parts = inputConnectionString.match(DIALECT_PARTS_REGEXP)!;
  const protocol = parts[1]!;
  const tail = parts[2]!;
  const outputConnectionString =
    protocol === 'pg' ? `postgres${tail}` : inputConnectionString;
  const inferredDialectName =
    options.dialectName ?? inferDialectName(inputConnectionString);

  return {
    connectionString: outputConnectionString,
    inferredDialectName,
  };
};

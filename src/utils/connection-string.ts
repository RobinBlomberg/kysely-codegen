import { config as loadEnv } from 'dotenv';
import { Logger } from './logger';

const CALL_STATEMENT_REGEXP = /^\s*([a-z]+)\s*\(\s*(.*)\s*\)\s*$/;

export const parseConnectionString = (options: {
  logger: Logger;
  url: string;
}) => {
  const { logger, url } = options;
  const expressionMatch = url.match(CALL_STATEMENT_REGEXP);

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
      throw new SyntaxError(`Invalid URL: '${url}'`);
    }

    if (typeof key !== 'string') {
      throw new TypeError(
        `Parameter 0 of function '${name}' must be a string.`,
      );
    }

    loadEnv();

    logger.info('Loaded environment variables from .env file.');

    const connectionString = process.env[key];

    if (!connectionString) {
      throw new ReferenceError(
        `Environment variable '${key}' could not be found.`,
      );
    }

    return connectionString;
  }

  try {
    void new URL(url);
  } catch {
    throw new SyntaxError(`Invalid URL: '${url}'`);
  }

  return url;
};

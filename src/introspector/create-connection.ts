import { Kysely, sql } from 'kysely';
import type { ConnectionCreator } from './types.js';

const establishDatabaseConnection = async (db: Kysely<any>) => {
  return await sql`SELECT 1;`.execute(db);
};

export const createConnection: ConnectionCreator = async (options) => {
  // Hacky solution in lieu of a better one.
  // We'll create a database connection with SSL, and if it complains about SSL, try without it.
  for (const ssl of [true, false]) {
    try {
      const dialect = await options.createKyselyDialect({
        connectionString: options.connectionString,
        ssl,
      });
      const db = new Kysely<any>({ dialect });
      await establishDatabaseConnection(db);
      return db;
    } catch (error) {
      const isSslError =
        error instanceof Error && /\bSSL\b/.test(error.message);
      const isUnexpectedError = !ssl || !isSslError;

      if (isUnexpectedError) {
        throw error;
      }
    }
  }

  throw new Error('Failed to connect to database.');
};

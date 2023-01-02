import { Kysely, sql } from 'kysely';
import { Dialect } from './dialect';
import { DatabaseMetadata } from './metadata';
import { TableMatcher } from './table-matcher';

export type ConnectOptions = {
  connectionString: string;
  dialect: Dialect;
};

export type IntrospectOptions<DB> = {
  db: Kysely<DB>;
  excludePattern?: string;
  includePattern?: string;
};

/**
 * Analyzes and returns metadata for a connected database.
 */
export abstract class Introspector<DB> {
  private async establishDatabaseConnection(db: Kysely<DB>) {
    return await sql`SELECT 1;`.execute(db);
  }

  async connect(options: ConnectOptions) {
    // Insane solution in lieu of a better one.
    // We'll create a database connection with SSL, and if it complains about SSL, try without it.
    for (const ssl of [true, false]) {
      try {
        const dialect = await options.dialect.createKyselyDialect({
          connectionString: options.connectionString,
          ssl,
        });

        const db = new Kysely<DB>({ dialect });

        await this.establishDatabaseConnection(db);

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
  }

  protected async getTables(options: IntrospectOptions<DB>) {
    let tables = await options.db.introspection.getTables();

    if (options.includePattern) {
      const tableMatcher = new TableMatcher(options.includePattern);
      tables = tables.filter(({ name, schema }) =>
        tableMatcher.match(schema, name),
      );
    }

    if (options.excludePattern) {
      const tableMatcher = new TableMatcher(options.excludePattern);
      tables = tables.filter(
        ({ name, schema }) => !tableMatcher.match(schema, name),
      );
    }

    return tables;
  }

  abstract introspect(
    options: IntrospectOptions<DB>,
  ): Promise<DatabaseMetadata>;
}

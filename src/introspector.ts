import { Kysely } from 'kysely';
import { Dialect } from './dialect';
import { DatabaseMetadata } from './metadata';
import { TableMatcher } from './table-matcher';

export type IntrospectionOptions = {
  connectionString: string;
  dialect: Dialect;
  excludePattern?: string;
  includePattern?: string;
};

export abstract class Introspector<DB> {
  protected async connect(options: IntrospectionOptions) {
    let db = undefined as unknown as Kysely<DB>;

    // Insane solution in lieu of a better one.
    // We'll create a database connection with SSL, and if it complains about SSL, try without it.
    for (const ssl of [true, false]) {
      try {
        const dialect = await options.dialect.createKyselyDialect({
          connectionString: options.connectionString,
          ssl,
        });

        db = new Kysely({ dialect });
      } catch (error) {
        const isSslError =
          error instanceof Error && /\bSSL\b/.test(error.message);
        const isUnexpectedError = !ssl || !isSslError;

        if (isUnexpectedError) {
          throw error;
        }
      }
    }

    return db;
  }

  protected async getTables(db: Kysely<DB>, options: IntrospectionOptions) {
    let tables = await db.introspection.getTables();

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

  abstract introspect(options: IntrospectionOptions): Promise<DatabaseMetadata>;
}

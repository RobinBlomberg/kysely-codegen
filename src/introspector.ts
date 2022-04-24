import { Kysely, TableMetadata } from 'kysely';
import { CodegenDialect } from './dialect';

export class CodegenDatabaseIntrospector {
  readonly connectionString: string;
  readonly dialect: CodegenDialect;

  constructor(options: { connectionString: string; dialect: CodegenDialect }) {
    this.connectionString = options.connectionString;
    this.dialect = options.dialect;
  }

  /**
   * Gets all public schemas from a database.
   *
   * @example
   * ```typescript
   * await introspect({
   *   connectionString: 'postgres://username:password@mydomain.com/database',
   *   driver: 'pg',
   * });
   *
   * // Output:
   * [
   *   {
   *     name: 'user',
   *     schema: 'public',
   *     columns: [
   *       { name: 'created_at', dataType: 'timestamptz', isNullable: false },
   *       { name: 'full_name', dataType: 'varchar', isNullable: true },
   *     ],
   *   },
   * ]
   * ```
   */
  async introspect() {
    let tables: TableMetadata[] = [];

    // Insane solution in lieu of a better one.
    // We'll create a database connection with SSL, and if it complains about SSL, try without it.
    for (const ssl of [true, false]) {
      try {
        const db = new Kysely({
          dialect: this.dialect.instantiate({
            connectionString: this.connectionString,
            ssl,
          }),
        });

        tables = await db.introspection.getTables();

        await db.destroy();
        break;
      } catch (error) {
        const isSslError =
          error instanceof Error && /\bSSL\b/.test(error.message);
        const isUnexpectedError = !ssl || !isSslError;

        if (isUnexpectedError) {
          throw error;
        }
      }
    }

    return tables
      .filter((table) => {
        return this.dialect.schema
          ? table.schema === this.dialect.schema
          : true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}

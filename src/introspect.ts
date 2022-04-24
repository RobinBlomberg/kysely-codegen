import { Kysely, TableMetadata } from 'kysely';
import { DIALECT_BY_DRIVER, Driver } from './dialects';

/**
 * Gets all public schemas from a database.
 *
 * @example
 * ```typescript
 * await introspect('postgres://username:password@mydomain.com/database');
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
export const introspect = async (options: {
  connectionString: string;
  driver: Driver;
}) => {
  const { connectionString, driver } = options;
  const dialect = DIALECT_BY_DRIVER[driver];
  let tables: TableMetadata[] = [];

  // Insane solution in lieu of a better one.
  // We'll create a database connection with SSL, and if it complains about SSL, try without it.
  for (const ssl of [true, false]) {
    try {
      const db = new Kysely({
        dialect: dialect.instantiate({ connectionString, ssl }),
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
      return dialect.schema ? table.schema === dialect.schema : true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

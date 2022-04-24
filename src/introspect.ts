import { Kysely, PostgresDialect, SqliteDialect } from 'kysely';
import { DIALECT_BY_DRIVER, Driver } from './dialects';

const getDialectForDriver = (options: {
  connectionString: string;
  driver: Driver;
}) => {
  const { connectionString, driver } = options;

  switch (driver) {
    case 'pg':
      return new PostgresDialect({
        connectionString,
        ssl: {
          rejectUnauthorized: false,
        },
      });
    default:
      return new SqliteDialect({
        databasePath: connectionString,
      });
  }
};

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

  const db = new Kysely<any>({
    dialect: getDialectForDriver({ connectionString, driver }),
  });

  const tables = await db.introspection.getTables();

  await db.destroy();

  return tables
    .filter((table) => {
      return dialect.schema ? table.schema === dialect.schema : true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

import { Kysely, PostgresDialect } from 'kysely';

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
export const introspect = async (connectionString: string) => {
  const db = new Kysely<any>({
    dialect: new PostgresDialect({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
  });

  const tables = await db.introspection.getTables();

  await db.destroy();

  return tables
    .filter((table) => table.schema === 'public')
    .sort((a, b) => a.name.localeCompare(b.name));
};

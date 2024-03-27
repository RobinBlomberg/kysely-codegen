import { MssqlDialect } from 'kysely';
import { createIntrospectorAdapter } from '../../adapter.js';
import { factory } from '../../factory.js';
import { introspectTables } from '../../introspect-tables.js';

const DEFAULT_MSSQL_PORT = 1433;

/**
 * @see https://www.connectionstrings.com/microsoft-data-sqlclient/using-a-non-standard-port/
 */
const parseMssqlConnectionString = async (connectionString: string) => {
  const { parseConnectionString } = await import(
    '@tediousjs/connection-string'
  );

  const parsed = parseConnectionString(connectionString) as Record<
    string,
    string
  >;
  const tokens = parsed.server!.split(',');
  const server = tokens[0]!;
  const port = tokens[1] ? parseInt(tokens[1], 10) : DEFAULT_MSSQL_PORT;

  return {
    database: parsed.database!,
    password: parsed.password!,
    port,
    server,
    userName: parsed['user id']!,
  };
};

export const mssqlAdapter = createIntrospectorAdapter({
  createKyselyDialect: async (options) => {
    const tarn = await import('tarn');
    const tedious = await import('tedious');

    const { database, password, port, server, userName } =
      await parseMssqlConnectionString(options.connectionString);

    return new MssqlDialect({
      tarn: {
        ...tarn,
        options: { min: 0, max: 1 },
      },
      tedious: {
        ...tedious,
        connectionFactory: () => {
          return new tedious.Connection({
            authentication: {
              options: { password, userName },
              type: 'default',
            },
            options: {
              database,
              port,
              trustServerCertificate: true,
            },
            server,
          });
        },
      },
    });
  },
  introspect: async (db, options = {}) => {
    const tables = await introspectTables(db, options);
    return factory.createDatabaseSchema({ tables });
  },
});

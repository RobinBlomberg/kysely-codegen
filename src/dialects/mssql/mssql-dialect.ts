import { MssqlDialect as KyselyMssqlDialect } from 'kysely';
import type { CreateKyselyDialectOptions } from '../../core';
import { Dialect } from '../../core';
import { MssqlAdapter } from './mssql-adapter';
import { MssqlIntrospector } from './mssql-introspector';

const DEFAULT_MSSQL_PORT = 1433;

export class MssqlDialect extends Dialect {
  readonly adapter = new MssqlAdapter();
  readonly introspector = new MssqlIntrospector();

  /**
   * @see https://www.connectionstrings.com/microsoft-data-sqlclient/using-a-non-standard-port/
   */
  async #parseConnectionString(connectionString: string) {
    const { parseConnectionString } = await import(
      '@tediousjs/connection-string'
    );

    const parsed = parseConnectionString(connectionString) as Record<
      string,
      string
    >;
    const tokens = parsed.server!.split(',');
    const server = tokens[0]!;
    const port = tokens[1]
      ? Number.parseInt(tokens[1], 10)
      : DEFAULT_MSSQL_PORT;

    return {
      database: parsed.database!,
      password: parsed.password!,
      port,
      server,
      userName: parsed['user id']!,
    };
  }

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const tarn = await import('tarn');
    const tedious = await import('tedious');

    const { database, password, port, server, userName } =
      await this.#parseConnectionString(options.connectionString);

    return new KyselyMssqlDialect({
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
  }
}

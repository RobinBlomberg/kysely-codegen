import { MssqlDialect as KyselyMssqlDialect } from 'kysely';
import type { CreateKyselyDialectOptions } from '../../dialect';
import { IntrospectorDialect } from '../../dialect';
import { MssqlIntrospector } from './mssql-introspector';

const DEFAULT_MSSQL_PORT = 1433;

export class MssqlIntrospectorDialect extends IntrospectorDialect {
  override readonly introspector = new MssqlIntrospector();

  /**
   * @see https://www.connectionstrings.com/microsoft-data-sqlclient/using-a-non-standard-port/
   */
  async #parseConnectionString(connectionString: string) {
    const { MSSQL_SCHEMA, parse } =
      await import('@tediousjs/connection-string');

    const schema = parse(connectionString).toSchema(MSSQL_SCHEMA) as Record<
      string,
      string | number | boolean
    >;
    const dataSource = schema['data source'] as string;
    const tokens = dataSource.split(',');
    const serverAndInstance = tokens[0]!.split('\\');
    const server = serverAndInstance[0]!;
    const instanceName = serverAndInstance[1];

    // Instance name and port are mutually exclusive.
    // See https://tediousjs.github.io/tedious/api-connection.html#:~:text=options.instanceName.
    const port =
      instanceName === undefined
        ? tokens[1]
          ? Number.parseInt(tokens[1], 10)
          : DEFAULT_MSSQL_PORT
        : undefined;

    return {
      database: schema['initial catalog'] as string,
      instanceName,
      password: schema.password as string,
      port,
      server,
      userName: schema['user id'] as string,
    };
  }

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const tarn = await import('tarn');
    const tedious = await import('tedious');

    const { database, instanceName, password, port, server, userName } =
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
              encrypt: options.ssl ?? true,
              instanceName,
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

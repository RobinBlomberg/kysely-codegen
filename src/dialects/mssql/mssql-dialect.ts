import { MssqlDialect as KyselyMssqlDialect } from 'kysely';
import { CreateKyselyDialectOptions, Dialect } from '../../core';
import { MssqlAdapter } from './mssql-adapter';
import { MssqlIntrospector } from './mssql-introspector';

export class MssqlDialect extends Dialect {
  readonly adapter = new MssqlAdapter();
  readonly introspector = new MssqlIntrospector();

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const tedious = await import('tedious');
    const tarn = await import('tarn');
    const { parseConnectionString } = await import(
      '@tediousjs/connection-string'
    );

    let server = '';
    let port = 1433;

    const connectionParams: any = parseConnectionString(
      options.connectionString,
    );

    server = connectionParams.server;
    // https://www.connectionstrings.com/microsoft-data-sqlclient/using-a-non-standard-port/
    if (server.includes(',')) {
      const [serverName, portString] = server.split(',') as [string, string];
      server = serverName;
      port = parseInt(portString, 10);
    }

    return new KyselyMssqlDialect({
      tarn: {
        ...tarn,
        options: {
          min: 0,
          max: 1,
        },
      },
      tedious: {
        ...tedious,
        connectionFactory: () =>
          new tedious.Connection({
            authentication: {
              type: 'default',
              options: {
                password: connectionParams.password,
                userName: connectionParams['user id'],
              },
            },
            options: {
              database: connectionParams.database,
              port,
              trustServerCertificate: true,
            },
            server,
          }),
      },
    });
  }
}

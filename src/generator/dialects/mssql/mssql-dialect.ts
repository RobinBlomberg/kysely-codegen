import { MssqlIntrospectorDialect } from '../../../introspector/dialects/mssql/mssql-dialect';
import type { GeneratorDialect } from '../../dialect';
import { MssqlAdapter } from './mssql-adapter';

const DEFAULT_MSSQL_PORT = 1433;

export class MssqlDialect
  extends MssqlIntrospectorDialect
  implements GeneratorDialect
{
  readonly adapter = new MssqlAdapter();

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
}

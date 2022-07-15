import { MysqlDialect } from 'kysely';
import * as mysql from 'mysql2';
import { CodegenDialect } from '../dialect';

export class CodegenMySqlDialect extends CodegenDialect {
  override readonly defaultType = 'string';
  override schema = 'public';

  override readonly types: Record<
    string,
    'string' | 'boolean' | 'number' | 'Date'
  > = {
    bit: 'boolean',
    datetime: 'Date',
    double: 'number',
    int: 'number',
    text: 'string',
    varchar: 'string',
  };

  instantiate(options: { connectionString: string; ssl: boolean }) {
    const parsedConnectionString: Record<string, string> = {};
    options.connectionString.split(';').forEach((entry) => {
      const [key, value] = entry.split('=');
      if (key && value) {
        parsedConnectionString[key] = value;
      }
    });

    const mysqlConfigOptions: mysql.ConnectionOptions = {
      database: parsedConnectionString.Database,
      host: parsedConnectionString.Server,
      password: parsedConnectionString.Pwd,
      port: Number(parsedConnectionString.Port),
      user: parsedConnectionString.Uid,
    };

    this.schema = mysqlConfigOptions.database || 'public';

    return new MysqlDialect({
      pool: mysql.createPool(mysqlConfigOptions),
    });
  }
}

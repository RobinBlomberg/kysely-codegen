import { MysqlDialect as KyselyMysqlDialect } from 'kysely';
import { Dialect, DriverInstantiateOptions } from '../../dialect';
import { MysqlAdapter } from './mysql-adapter';

export class MysqlDialect extends Dialect {
  readonly adapter = new MysqlAdapter();

  async createKyselyDialect(options: DriverInstantiateOptions) {
    const { createPool } = await import('mysql2');

    return new KyselyMysqlDialect({
      pool: createPool({
        uri: options.connectionString,
      }),
    });
  }
}

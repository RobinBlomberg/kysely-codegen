import { MysqlDialect as KyselyMysqlDialect } from 'kysely';
import mysql2 from 'mysql2';
import { CreateKyselyDialectOptions, Dialect } from '../../dialect';
import { MysqlAdapter } from './mysql-adapter';
import { MysqlIntrospector } from './mysql-introspector';

export class MysqlDialect extends Dialect {
  readonly adapter = new MysqlAdapter();
  readonly introspector = new MysqlIntrospector();

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const { createPool } = mysql2;
    return new KyselyMysqlDialect({
      pool: createPool({
        uri: options.connectionString,
      }),
    });
  }
}

import { MysqlDialect as KyselyMysqlDialect } from 'kysely';
import { CreateKyselyDialectOptions, Dialect } from '../../core';
import { MysqlAdapter } from './mysql-adapter';
import { MysqlIntrospector } from './mysql-introspector';

export class MysqlDialect extends Dialect {
  readonly adapter = new MysqlAdapter();
  readonly introspector = new MysqlIntrospector();

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const { createPool } = await import('mysql2');

    return new KyselyMysqlDialect({
      pool: createPool({
        uri: options.connectionString,
      }),
    });
  }
}

import { MysqlDialect as KyselyMysqlDialect } from 'kysely';
import type { CreateKyselyDialectOptions } from '../../introspector';
import { Dialect } from '../../introspector';
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

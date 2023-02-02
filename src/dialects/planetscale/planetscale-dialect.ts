import { PlanetScaleDialect as KyselyPlanetScaleDialect } from 'kysely-planetscale';
import fetch from 'node-fetch';
import { CreateKyselyDialectOptions, Dialect } from '../../dialect';
import { MysqlAdapter } from '../mysql/mysql-adapter';
import { MysqlIntrospector } from '../mysql/mysql-introspector';

export class PlanetscaleDialect extends Dialect {
  readonly adapter = new MysqlAdapter();
  readonly introspector = new MysqlIntrospector();

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    return new KyselyPlanetScaleDialect({
      fetch,
      url: options.connectionString,
    });
  }
}

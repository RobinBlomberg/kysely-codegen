import { CreateKyselyDialectOptions, Dialect } from '../../dialect';
import { MysqlAdapter } from '../mysql/mysql-adapter';
import { MysqlIntrospector } from '../mysql/mysql-introspector';

export class PlanetscaleDialect extends Dialect {
  readonly adapter = new MysqlAdapter();
  readonly introspector = new MysqlIntrospector();

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const kyselyPlanetscale = import('kysely-planetscale');

    const config = {
      fetch,
      url: options.connectionString,
    };

    return new (await kyselyPlanetscale).PlanetScaleDialect(config);
  }
}

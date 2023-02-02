import { CreateKyselyDialectOptions, Dialect } from '../../dialect';
import { MysqlAdapter } from '../mysql/mysql-adapter';
import { MysqlIntrospector } from '../mysql/mysql-introspector';

export class PlanetscaleDialect extends Dialect {
  readonly adapter = new MysqlAdapter();
  readonly introspector = new MysqlIntrospector();

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    const [
      { default: fetch },
      { PlanetScaleDialect: KyselyPlanetScaleDialect },
    ] = await Promise.all([import('node-fetch'), import('kysely-planetscale')]);

    return new KyselyPlanetScaleDialect({
      fetch,
      url: options.connectionString,
    });
  }
}

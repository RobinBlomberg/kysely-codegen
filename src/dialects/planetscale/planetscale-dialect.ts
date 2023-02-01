import { CreateKyselyDialectOptions, Dialect } from '../../dialect';
import { MysqlAdapter } from '../mysql/mysql-adapter';
import { MysqlIntrospector } from '../mysql/mysql-introspector';
import { PlanetScaleDialect } from './pscale-dialect';

export class PlanetscaleDialect extends Dialect {
  readonly adapter = new MysqlAdapter();
  readonly introspector = new MysqlIntrospector();

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    return new PlanetScaleDialect({ url: options.connectionString });
  }
}

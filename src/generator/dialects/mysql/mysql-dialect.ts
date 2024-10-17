import { MysqlIntrospectorDialect } from '../../../introspector/dialects/mysql/mysql-dialect';
import type { GeneratorDialect } from '../../dialect';
import { MysqlAdapter } from './mysql-adapter';

export class MysqlDialect
  extends MysqlIntrospectorDialect
  implements GeneratorDialect
{
  readonly adapter = new MysqlAdapter();
}

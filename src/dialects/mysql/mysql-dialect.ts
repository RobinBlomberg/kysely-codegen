import { MysqlIntrospectorDialect } from '../../introspector/dialects/mysql/mysql-dialect';
import { MysqlAdapter } from './mysql-adapter';

export class MysqlDialect extends MysqlIntrospectorDialect {
  readonly adapter = new MysqlAdapter();
}

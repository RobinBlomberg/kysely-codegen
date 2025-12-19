import { MysqlIntrospectorDialect } from '../../../introspector/dialects/mysql/mysql-dialect';
import type { GeneratorDialect } from '../../dialect';
import { MysqlAdapter } from './mysql-adapter';
import type { MysqlDateStrings } from './date-strings';

export type MysqlDialectOptions = {
  dateStrings?: MysqlDateStrings;
};

export class MysqlDialect
  extends MysqlIntrospectorDialect
  implements GeneratorDialect
{
  readonly adapter: MysqlAdapter;

  constructor(options?: MysqlDialectOptions) {
    super();
    this.adapter = new MysqlAdapter({ dateStrings: options?.dateStrings });
  }
}

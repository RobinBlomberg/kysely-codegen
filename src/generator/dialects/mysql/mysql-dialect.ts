import { DateParser } from '../../../introspector';
import { MysqlIntrospectorDialect } from '../../../introspector/dialects/mysql/mysql-dialect';
import type { GeneratorDialect } from '../../dialect';
import { MysqlAdapter } from './mysql-adapter';

type MysqlDialectOptions = {
  dateParser?: DateParser;
  defaultSchemas?: string[];
};

export class MysqlDialect
  extends MysqlIntrospectorDialect
  implements GeneratorDialect
{
  readonly adapter: MysqlAdapter;
  readonly options: MysqlDialectOptions;

  constructor(options?: MysqlDialectOptions) {
    super();
    this.options = options || {};
    this.adapter = new MysqlAdapter({
      dateParser: this.options.dateParser,
    });
  }
}

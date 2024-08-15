import { LibsqlIntrospectorDialect } from '../../introspector/dialects/libsql/libsql-dialect';
import { LibsqlAdapter } from './libsql-adapter';

export class LibsqlDialect extends LibsqlIntrospectorDialect {
  readonly adapter = new LibsqlAdapter();
}

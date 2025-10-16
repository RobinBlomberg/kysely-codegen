import { LibsqlIntrospectorDialect } from '../../../introspector/dialects/libsql/libsql-dialect';
import type { GeneratorDialect } from '../../dialect';
import { LibsqlAdapter } from './libsql-adapter';
export declare class LibsqlDialect extends LibsqlIntrospectorDialect implements GeneratorDialect {
    readonly adapter: LibsqlAdapter;
}

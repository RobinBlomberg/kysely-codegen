import { MssqlIntrospectorDialect } from '../../../introspector/dialects/mssql/mssql-dialect';
import type { GeneratorDialect } from '../../dialect';
import { MssqlAdapter } from './mssql-adapter';
export declare class MssqlDialect extends MssqlIntrospectorDialect implements GeneratorDialect {
    readonly adapter: MssqlAdapter;
}

import type { IntrospectOptions } from '../../introspector';
import { Introspector } from '../../introspector';
import { DatabaseMetadata } from '../../metadata/database-metadata';
export declare class KyselyBunSqliteIntrospector extends Introspector<any> {
    introspect(options: IntrospectOptions<any>): Promise<DatabaseMetadata>;
}

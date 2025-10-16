import type { IntrospectOptions } from '../../introspector';
import { Introspector } from '../../introspector';
import { DatabaseMetadata } from '../../metadata/database-metadata';
export declare class LibsqlIntrospector extends Introspector<any> {
    introspect(options: IntrospectOptions<any>): Promise<DatabaseMetadata>;
}

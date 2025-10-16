import type { Kysely, TableMetadata as KyselyTableMetadata } from 'kysely';
import { EnumCollection } from '../../enum-collection';
import type { IntrospectOptions } from '../../introspector';
import { Introspector } from '../../introspector';
import { DatabaseMetadata } from '../../metadata/database-metadata';
import type { MysqlDB } from './mysql-db';
export declare class MysqlIntrospector extends Introspector<MysqlDB> {
    createDatabaseMetadata({ enums, tables: rawTables, }: {
        enums: EnumCollection;
        tables: KyselyTableMetadata[];
    }): DatabaseMetadata;
    introspect(options: IntrospectOptions<MysqlDB>): Promise<DatabaseMetadata>;
    introspectEnums(db: Kysely<MysqlDB>): Promise<EnumCollection>;
}

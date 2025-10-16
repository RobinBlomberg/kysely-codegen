import type { Kysely, ColumnMetadata as KyselyColumnMetaData, TableMetadata as KyselyTableMetadata } from 'kysely';
import { EnumCollection } from '../../enum-collection';
import type { IntrospectOptions } from '../../introspector';
import { Introspector } from '../../introspector';
import { DatabaseMetadata } from '../../metadata/database-metadata';
import type { PostgresDB } from './postgres-db';
export type PostgresDomainInspector = {
    rootType: string;
    typeName: string;
    typeSchema: string;
};
export type TableReference = {
    schema?: string;
    name: string;
};
export type PostgresIntrospectorOptions = {
    defaultSchemas?: string[];
    domains?: boolean;
    partitions?: boolean;
};
export declare class PostgresIntrospector extends Introspector<PostgresDB> {
    protected readonly options: PostgresIntrospectorOptions;
    constructor(options?: PostgresIntrospectorOptions);
    createDatabaseMetadata({ domains, enums, partitions, tables: rawTables, }: {
        domains: PostgresDomainInspector[];
        enums: EnumCollection;
        partitions: TableReference[];
        tables: KyselyTableMetadata[];
    }): DatabaseMetadata;
    getRootType(column: KyselyColumnMetaData, domains: PostgresDomainInspector[]): string;
    introspect(options: IntrospectOptions<PostgresDB>): Promise<DatabaseMetadata>;
    introspectDomains(db: Kysely<PostgresDB>): Promise<PostgresDomainInspector[]>;
    introspectEnums(db: Kysely<PostgresDB>): Promise<EnumCollection>;
    introspectPartitions(db: Kysely<PostgresDB>): Promise<TableReference[]>;
}

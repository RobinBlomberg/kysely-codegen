"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresIntrospector = void 0;
const kysely_1 = require("kysely");
const enum_collection_1 = require("../../enum-collection");
const introspector_1 = require("../../introspector");
const database_metadata_1 = require("../../metadata/database-metadata");
class PostgresIntrospector extends introspector_1.Introspector {
    constructor(options) {
        super();
        this.options = {
            defaultSchemas: options?.defaultSchemas && options.defaultSchemas.length > 0
                ? options.defaultSchemas
                : ['public'],
            domains: options?.domains ?? true,
            partitions: options?.partitions,
        };
    }
    createDatabaseMetadata({ domains, enums, partitions, tables: rawTables, }) {
        const tables = rawTables
            .map((table) => {
            const columns = table.columns.map((column) => {
                const dataType = this.getRootType(column, domains);
                const enumValues = enums.get(`${column.dataTypeSchema ?? this.options.defaultSchemas}.${dataType}`);
                const isArray = dataType.startsWith('_');
                return {
                    comment: column.comment ?? null,
                    dataType: isArray ? dataType.slice(1) : dataType,
                    dataTypeSchema: column.dataTypeSchema,
                    enumValues,
                    hasDefaultValue: column.hasDefaultValue,
                    isArray,
                    isAutoIncrementing: column.isAutoIncrementing,
                    isNullable: column.isNullable,
                    name: column.name,
                };
            });
            const isPartition = partitions.some((partition) => {
                return (partition.schema === table.schema && partition.name === table.name);
            });
            return {
                columns,
                isPartition,
                isView: table.isView,
                name: table.name,
                schema: table.schema,
            };
        })
            .filter((table) => {
            return this.options.partitions ? true : !table.isPartition;
        });
        return new database_metadata_1.DatabaseMetadata({ enums, tables });
    }
    getRootType(column, domains) {
        const foundDomain = domains.find((domain) => {
            return (domain.typeName === column.dataType &&
                domain.typeSchema === column.dataTypeSchema);
        });
        return foundDomain?.rootType ?? column.dataType;
    }
    async introspect(options) {
        const tables = await this.getTables(options);
        const [domains, enums, partitions] = await Promise.all([
            this.introspectDomains(options.db),
            this.introspectEnums(options.db),
            this.introspectPartitions(options.db),
        ]);
        return this.createDatabaseMetadata({ enums, domains, partitions, tables });
    }
    async introspectDomains(db) {
        if (!this.options.domains) {
            return [];
        }
        const result = await (0, kysely_1.sql) `
      with recursive domain_hierarchy as (
        select oid, typbasetype
        from pg_type
        where typtype = 'd'
        and 'information_schema'::regnamespace::oid <> typnamespace

        union all

        select dh.oid, t.typbasetype
        from domain_hierarchy as dh
        join pg_type as t ON t.oid = dh.typbasetype
      )

      select
        t.typname as "typeName",
        t.typnamespace::regnamespace::text as "typeSchema",
        bt.typname as "rootType"
      from domain_hierarchy as dh
      join pg_type as t on dh.oid = t.oid
      join pg_type as bt on dh.typbasetype = bt.oid
      where bt.typbasetype = 0;
    `.execute(db);
        return result.rows;
    }
    async introspectEnums(db) {
        const enums = new enum_collection_1.EnumCollection();
        const rows = await db
            .withoutPlugins()
            .selectFrom('pg_type as type')
            .innerJoin('pg_enum as enum', 'type.oid', 'enum.enumtypid')
            .innerJoin('pg_catalog.pg_namespace as namespace', 'namespace.oid', 'type.typnamespace')
            .select([
            'namespace.nspname as schemaName',
            'type.typname as enumName',
            'enum.enumlabel as enumValue',
        ])
            .execute();
        for (const row of rows) {
            enums.add(`${row.schemaName}.${row.enumName}`, row.enumValue);
        }
        return enums;
    }
    async introspectPartitions(db) {
        const result = await (0, kysely_1.sql) `
      select pg_namespace.nspname as schema, pg_class.relname as name
      from pg_inherits
      join pg_class on pg_inherits.inhrelid = pg_class.oid
      join pg_namespace on pg_namespace.oid = pg_class.relnamespace;
    `.execute(db);
        return result.rows;
    }
}
exports.PostgresIntrospector = PostgresIntrospector;
//# sourceMappingURL=postgres-introspector.js.map
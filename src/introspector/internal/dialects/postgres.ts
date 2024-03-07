import type { Kysely } from 'kysely';
import { PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import { createIntrospectorAdapter } from '../../adapter.js';
import { EnumMap } from '../../enum-map.js';
import { factory } from '../../factory.js';
import { introspectTables } from '../../introspect-tables.js';
import type { ColumnSchema } from '../../types.js';
import { PostgresParser } from './postgres.parser.js';

type IntrospectedCheck = {
  schema: string;
  table: string;
  definition: string;
};

type IntrospectedDomain = {
  rootType: string;
  typeName: string;
  typeSchema: string;
};

type DB = {
  'pg_catalog.pg_namespace': {
    nspname: string;
    oid: number;
  };
  pg_enum: {
    enumlabel: string;
    enumtypid: number;
  };
  pg_type: {
    oid: number;
    typname: string;
    typnamespace: number;
  };
};

const getRootDataType = (
  column: ColumnSchema,
  domains: IntrospectedDomain[],
) => {
  const foundDomain = domains.find((domain) => {
    return (
      domain.typeName === column.dataType &&
      domain.typeSchema === column.dataTypeSchema
    );
  });
  return foundDomain?.rootType ?? column.dataType;
};

const introspectCheckEnums = async (db: Kysely<DB>) => {
  const result = await sql<IntrospectedCheck>`
    select
      n.nspname as schema,
      conrelid::regclass as table,
      pg_get_constraintdef(c.oid) as definition
    from pg_constraint c
    join pg_namespace n
    on n.oid = c.connamespace
    where contype = 'c'
    and n.nspname != 'information_schema'
    order by
      conrelid::regclass::text,
      contype desc;
  `.execute(db);
  const enums = new EnumMap();
  const rows = result.rows;

  for (const row of rows) {
    try {
      const enumValues = PostgresParser.parseEnumCheck(row.definition);
      const enumKey = `${row.schema}.${row.table}`;
      enums.set(enumKey, enumValues);
    } catch {}
  }

  return enums;
};

const introspectDomains = async (db: Kysely<any>) => {
  const result = await sql<IntrospectedDomain>`
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
};

const introspectEnums = async (db: Kysely<any>) => {
  const enums = new EnumMap();
  const rows = await db
    .withoutPlugins()
    .selectFrom('pg_type as type')
    .innerJoin('pg_enum as enum', 'type.oid', 'enum.enumtypid')
    .innerJoin(
      'pg_catalog.pg_namespace as namespace',
      'namespace.oid',
      'type.typnamespace',
    )
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
};

export const postgresAdapter = createIntrospectorAdapter({
  createKyselyDialect: (options) => {
    return new PostgresDialect({
      pool: new Pool({
        connectionString: options.connectionString,
        ssl: options.ssl ? { rejectUnauthorized: false } : false,
      }),
    });
  },
  introspect: async (db, options = {}) => {
    const [checkEnums, domains, enums, rawTables] = await Promise.all([
      introspectCheckEnums(db),
      introspectDomains(db),
      introspectEnums(db),
      introspectTables(db, options),
    ]);

    const tables = rawTables.map((table) => {
      const columns = table.columns.map((column) => {
        const rootDataType = getRootDataType(column, domains);
        const isArray = rootDataType.startsWith('_');
        const dataType = isArray ? rootDataType.slice(1) : rootDataType;
        const dataTypeSchema = column.dataTypeSchema;
        const enumKey = `${column.dataTypeSchema ?? 'public'}.${rootDataType}`;
        const enumValues = enums.get(enumKey);
        const checkEnumKey = `${table.schema}.${table.name}`;
        const checkEnumValues = checkEnums.get(checkEnumKey);
        return factory.createColumnSchema({
          ...column,
          dataType,
          dataTypeSchema,
          enumValues: [...enumValues, ...checkEnumValues],
          isArray,
        });
      });
      return factory.createTableSchema({ ...table, columns });
    });

    return factory.createDatabaseSchema({ enums, tables });
  },
});

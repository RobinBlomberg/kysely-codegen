import type { Kysely } from 'kysely';
import { factory } from './factory.js';
import { matchTableName } from './internal/match-table-name.js';
import type { DialectIntrospectionOptions, TableSchema } from './types.js';

const filterTableSchemas = (
  tables: TableSchema[],
  options: DialectIntrospectionOptions,
) => {
  return tables.filter((table) => {
    if (
      options.includePattern &&
      !matchTableName(table.schema, table.name, options.includePattern)
    ) {
      return false;
    } else if (
      options.excludePattern &&
      matchTableName(table.schema, table.name, options.excludePattern)
    ) {
      return false;
    }
    return true;
  });
};

export const introspectTables = async <DB>(
  db: Kysely<DB>,
  options: DialectIntrospectionOptions = {},
) => {
  const tables = await db.introspection.getTables();
  const tableSchemas = tables.map((table) => {
    const columns = table.columns.map((column) => {
      return factory.createColumnSchema(column);
    });
    return factory.createTableSchema({ ...table, columns });
  });
  return filterTableSchemas(tableSchemas, options);
};

import {
  PostgresDialect as KyselyPostgresDialect,
  TableMetadata,
} from 'kysely';
import { toPascalCase } from '../../case-converter';
import { Dialect, DriverInstantiateOptions } from '../../dialect';
import { PostgresAdapter } from './postgres-adapter';

export class PostgresDialect extends Dialect {
  readonly adapter = new PostgresAdapter();

  async createKyselyDialect(options: DriverInstantiateOptions) {
    const { Pool } = await import('pg');

    return new KyselyPostgresDialect({
      pool: new Pool({
        connectionString: options.connectionString,
        ssl: options.ssl ? { rejectUnauthorized: false } : false,
      }),
    });
  }

  override getExportedTableName(
    table: TableMetadata,
    camelCase: boolean,
  ): string {
    const tableName = super.getExportedTableName(table, camelCase);
    return table.schema === 'public'
      ? tableName
      : `${table.schema}.${tableName}`;
  }

  override getSymbolName(table: TableMetadata): string {
    const symbolName = super.getSymbolName(table);
    return table.schema === 'public'
      ? symbolName
      : toPascalCase(`${table.schema}_${symbolName}`);
  }
}

import {
  PostgresDialect as KyselyPostgresDialect,
  TableMetadata,
} from 'kysely';
import { Dialect, DriverInstantiateOptions } from '../../dialect';
import { pascalCase } from '../../util';
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

  override getExportedTableName(table: TableMetadata): string {
    return table.schema === 'public'
      ? super.getExportedTableName(table)
      : `${table.schema}.${table.name}`;
  }

  override getSymbolName(table: TableMetadata): string {
    return table.schema === 'public'
      ? super.getSymbolName(table)
      : pascalCase(`${table.schema}_${table.name}`);
  }
}

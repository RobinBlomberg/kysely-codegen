import { PostgresDialect, TableMetadata } from 'kysely';
import { Pool } from 'pg';
import { CodegenDialect } from '../dialect';
import { pascalCase } from '../util';

export class CodegenPostgresDialect extends CodegenDialect {
  override readonly defaultType = 'string';
  override readonly definitions = {
    Circle: {
      radius: 'number',
      x: 'number',
      y: 'number',
    },
  };
  override readonly imports = {
    IPostgresInterval: 'postgres-interval',
  };
  override readonly types = {
    bool: 'boolean',
    bytea: 'Buffer',
    circle: 'Circle',
    float4: 'number',
    float8: 'number',
    int2: 'number',
    int4: 'number',
    int8: 'number',
    interval: 'IPostgresInterval',
    json: 'unknown',
    jsonb: 'unknown',
    numeric: 'number',
    oid: 'number',
    text: 'string',
    timestamp: 'number | string | Date',
    timestamptz: 'number | string | Date',
  };

  instantiate(options: { connectionString: string; ssl: boolean }) {
    return new PostgresDialect({
      pool: new Pool({
        connectionString: options.connectionString,
        ssl: options.ssl ? { rejectUnauthorized: false } : false,
      }),
    });
  }

  override getModelName(table: TableMetadata): string {
    if (table.schema !== 'public') {
      return pascalCase(`${table.schema}_${table.name}`);
    }

    return super.getModelName(table);
  }

  override getExportedTableName(table: TableMetadata): string {
    if (table.schema !== 'public') {
      return `${table.schema}.${table.name}`;
    }

    return super.getExportedTableName(table);
  }
}

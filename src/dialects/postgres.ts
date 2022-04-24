import { PostgresDialect } from 'kysely';
import { CodegenDialect } from '../dialect';

export class CodegenPostgresDialect extends CodegenDialect {
  override readonly defaultType = 'string';
  override readonly imports = {
    IPostgresInterval: 'postgres-interval',
  };

  override readonly models = {
    Circle: {
      radius: 'number',
      x: 'number',
      y: 'number',
    },
  };

  override readonly schema = 'public';
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
    timestamp: 'number',
    timestamptz: 'number',
  };

  instantiate(options: { connectionString: string; ssl: boolean }) {
    return new PostgresDialect({
      connectionString: options.connectionString,
      ssl: options.ssl ? { rejectUnauthorized: false } : false,
    });
  }
}

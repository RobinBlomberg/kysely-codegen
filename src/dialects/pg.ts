import { PostgresDialect } from 'kysely';
import { Dialect } from '../utils/types';

export const pgDialect: Dialect = {
  defaultType: 'string',
  imports: {
    IPostgresInterval: 'postgres-interval',
  },
  instantiate: ({ connectionString, ssl }) => {
    return new PostgresDialect({
      connectionString,
      ssl: ssl ? { rejectUnauthorized: false } : false,
    });
  },
  models: {
    Circle: {
      radius: 'number',
      x: 'number',
      y: 'number',
    },
  },
  schema: 'public',
  types: {
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
  },
};

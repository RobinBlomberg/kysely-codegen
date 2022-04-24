import { SqliteDialect } from 'kysely';
import { Dialect } from '../utils/types';

export const betterSqlite3Dialect: Dialect = {
  defaultType: 'string',
  instantiate: ({ connectionString }) => {
    return new SqliteDialect({ databasePath: connectionString });
  },
  types: {
    ANY: 'unknown',
    BLOB: 'Buffer',
    INT: 'number',
    INTEGER: 'number',
    NUMERIC: 'number',
    REAL: 'number',
    TEXT: 'string',
  },
};

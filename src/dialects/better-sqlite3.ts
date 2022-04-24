import { Dialect } from '../types';

export const betterSqlite3Dialect: Dialect = {
  defaultType: 'string',
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

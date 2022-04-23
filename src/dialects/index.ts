import { pgDialect } from './pg';

export type Driver = keyof typeof DIALECT_BY_DRIVER;

export const DIALECT_BY_DRIVER = {
  pg: pgDialect,
};

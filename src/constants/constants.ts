import { join } from 'path';

export const DEFAULT_OUT_FILE = join(
  process.cwd(),
  'node_modules',
  'kysely-codegen',
  'dist',
  'db.d.ts',
);

export const DEFAULT_URL = 'env(DATABASE_URL)';

export const LOG_LEVEL_NAMES = [
  'silent',
  'info',
  'warn',
  'error',
  'debug',
] as const;

export const VALID_DIALECTS = ['mysql', 'postgres', 'sqlite'];

export const VALID_FLAGS = new Set([
  '_',
  'camel-case',
  'dialect',
  'exclude-pattern',
  'h',
  'help',
  'include-pattern',
  'log-level',
  'out-file',
  'print',
  'url',
]);

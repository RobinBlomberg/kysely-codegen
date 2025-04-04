import { join } from 'path';
import type { RuntimeEnumsStyle } from '../generator/generator/runtime-enums-style';

export const DEFAULT_OUT_FILE = join(
  process.cwd(),
  'node_modules',
  'kysely-codegen',
  'dist',
  'db.d.ts',
);

export const DEFAULT_RUNTIME_ENUMS_STYLE: RuntimeEnumsStyle =
  'screaming-snake-case';

export const DEFAULT_URL = 'env(DATABASE_URL)';

export const LOG_LEVEL_NAMES = [
  'debug',
  'info',
  'warn',
  'error',
  'silent',
] as const;

export const VALID_DIALECTS = [
  'postgres',
  'mysql',
  'sqlite',
  'mssql',
  'libsql',
  'bun-sqlite',
  'kysely-bun-sqlite',
  'worker-bun-sqlite',
];

import { join } from 'path';
import { RuntimeEnumsStyle } from '../generator/generator/runtime-enums-style';
import { LogLevel } from '../generator/logger/log-level';

export const DEFAULT_OUT_FILE = join(
  process.cwd(),
  'node_modules',
  'kysely-codegen',
  'dist',
  'db.d.ts',
);

export const DEFAULT_LOG_LEVEL = LogLevel.WARN;

export const DEFAULT_RUNTIME_ENUMS_STYLE =
  RuntimeEnumsStyle.SCREAMING_SNAKE_CASE;

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

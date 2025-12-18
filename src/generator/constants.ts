import { join } from 'node:path';

export const DEFAULT_OUT_FILE = join(
  process.cwd(),
  'node_modules',
  'kysely-generate',
  'dist',
  'db.d.ts',
);

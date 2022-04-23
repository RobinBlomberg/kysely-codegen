import { promises as fs } from 'fs';
import { parse, relative, sep } from 'path';
import { parseConnectionString } from './connection-string';
import { Driver } from './dialects';
import { introspect } from './introspect';
import { serialize, Style } from './serialize';

/**
 * Generates a file with database type definitions.
 *
 * @example
 * ```typescript
 * import { generate } from 'kysely-codegen';
 *
 * await generate({
 *   driver: 'pg',
 *   outFile: './kysely-codegen/index.d.ts',
 *   style: 'type',
 *   url: 'env(DATABASE_URL)',
 * });
 *
 * // Output:
 * export type User = {
 *   created_at: Date;
 *   email: string;
 *   full_name: string;
 *   is_active: boolean;
 * };
 * ```
 */
export const generate = async (options: {
  driver: Driver;
  outFile: string;
  style?: Style;
  url: string;
}) => {
  const { driver, outFile, style = 'interface', url } = options;
  const connectionString = parseConnectionString(url);

  const startTime = performance.now();

  const tables = await introspect(connectionString);

  const data = serialize({ driver, style, tables });
  const outDir = parse(outFile).dir;

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outFile, data);

  const endTime = performance.now();
  const relativeOutDir = `.${sep}${relative(process.cwd(), outFile)}`;
  const duration = Math.round(endTime - startTime);

  console.info(
    `Introspected ${tables.length} models and generated ${relativeOutDir} in ${duration}ms.`,
  );
};

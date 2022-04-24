import { promises as fs } from 'fs';
import { parse, relative, sep } from 'path';
import { parseConnectionString } from './connection-string';
import { DIALECT_BY_DRIVER, Driver } from './dialects';
import { LogLevel } from './enums/log-level';
import { introspect } from './introspect';
import { Logger } from './logger';
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
  logLevel: LogLevel;
  outFile: string;
  print: boolean;
  style?: Style;
  url: string;
}) => {
  const {
    driver,
    logLevel,
    outFile,
    print,
    style = 'interface',
    url,
  } = options;

  const logger = new Logger(logLevel);
  const connectionString = parseConnectionString({ logger, url });
  const startTime = performance.now();

  logger.info('Introspecting database...');

  const tables = await introspect({ connectionString, driver });

  logger.debug();
  logger.debug(`Found ${tables.length} public tables:`);

  for (const table of tables) {
    logger.debug(` - ${table.name}`);
  }

  logger.debug();

  const dialect = DIALECT_BY_DRIVER[driver];
  const data = serialize({ dialect, style, tables });

  if (print) {
    console.log();
    console.log(data);
  } else {
    const outDir = parse(outFile).dir;

    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(outFile, data);

    const endTime = performance.now();
    const relativeOutDir = `.${sep}${relative(process.cwd(), outFile)}`;
    const duration = Math.round(endTime - startTime);

    logger.success(
      `Introspected ${tables.length} tables and generated ${relativeOutDir} in ${duration}ms.`,
    );
  }
};

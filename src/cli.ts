#!/usr/bin/env node
import minimist from 'minimist';
import { getLogLevel, LogLevel } from './enums/log-level';
import { generate } from './generate';
import { Logger } from './logger';
import { Style } from './types';

const DEFAULT_OUT_FILE = './node_modules/kysely-codegen/dist/index.d.ts';
const VALID_FLAGS = new Set([
  '_',
  'driver',
  'help',
  'out-file',
  'log-level',
  'style',
  'url',
]);

(async () => {
  const argv = minimist(process.argv.slice(2));

  const _: string[] = argv._;
  const driver: 'pg' = argv.driver ?? 'pg';
  const h: boolean = argv.h ?? false;
  const help: boolean = argv.help ?? false;
  const outFile: string = argv['out-file'] ?? DEFAULT_OUT_FILE;
  const logLevel = getLogLevel(argv['log-level']);
  const style: Style = argv.style ?? 'interface';
  const url: string = argv.url ?? 'env(DATABASE_URL)';

  const logger = new Logger(logLevel);

  try {
    for (const key in argv) {
      if (!VALID_FLAGS.has(key)) {
        throw new RangeError(`Invalid flag: "${key}"`);
      }
    }

    if (h || help || _.includes('-h') || _.includes('--help')) {
      logger.log(
        '\n' +
          'kysely-codegen <options>\n' +
          '\n' +
          '  --driver     Set the SQL driver. (values: [pg], default: pg)\n' +
          '  --help, -h   Print this message.\n' +
          '  --log-level  Set the terminal log level. (values: [debug, info, warn, error, silent], default: warn)\n' +
          `  --out-file   Set the file build path. (default: ${DEFAULT_OUT_FILE})\n` +
          '  --style      Set the output style. (values: [interface, type], default: interface)\n' +
          '  --url        Set the database connection string URL. This may point to an environment variable. (default: env(DATABASE_URL))\n',
      );
      process.exit(0);
    }

    if (driver !== 'pg') {
      throw new RangeError(
        "Parameter '--driver' must have one of the following values: pg",
      );
    }

    if (!['interface', 'type'].includes(style)) {
      throw new RangeError(
        "Parameter '--style' must have one of the following values: interface, type",
      );
    }

    if (!url) {
      throw new TypeError(
        "Parameter '--url' must be a valid connection string. Examples:\n\n" +
          '  --url=postgres://username:password@mydomain.com/database\n' +
          '  --url=env(DATABASE_URL)',
      );
    }

    await generate({ driver, logLevel, outFile, style, url });
  } catch (error) {
    if (logLevel > LogLevel.SILENT) {
      if (error instanceof Error) {
        console.error(logger.serializeError(error.message));

        if (logLevel >= LogLevel.DEBUG) {
          console.error();
          throw error;
        } else {
          process.exit(0);
        }
      } else {
        throw error;
      }
    }
  }
})();

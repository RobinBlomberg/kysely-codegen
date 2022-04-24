#!/usr/bin/env node
import minimist from 'minimist';
import { getLogLevel, LogLevel } from './enums/log-level';
import { generate } from './generate';
import { Logger } from './logger';
import { Style } from './types';

const DEFAULT_OUT_FILE = './node_modules/kysely-codegen/dist/index.d.ts';
const VALID_DRIVERS = ['better-sqlite3', 'pg', 'sqlite3'];
const VALID_STYLES = ['interface', 'type'];

const VALID_FLAGS = new Set([
  '_',
  'driver',
  'h',
  'help',
  'log-level',
  'out-file',
  'print',
  'style',
  'url',
]);

(async () => {
  const argv = minimist(process.argv.slice(2));

  const _: string[] = argv._;
  const driver = argv.driver;
  const h = !!argv.h;
  const help = !!argv.help;
  const logLevel = getLogLevel(argv['log-level']);
  const outFile: string = argv['out-file'] ?? DEFAULT_OUT_FILE;
  const print = !!argv.print;
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
          'kysely-codegen [options]\n' +
          '\n' +
          `  --driver     Set the SQL driver. (values: [${VALID_DRIVERS.join(
            ', ',
          )}])\n` +
          '  --help, -h   Print this message.\n' +
          '  --log-level  Set the terminal log level. (values: [debug, info, warn, error, silent], default: warn)\n' +
          `  --out-file   Set the file build path. (default: ${DEFAULT_OUT_FILE})\n` +
          '  --print      Print the generated output to the terminal.\n' +
          `  --style      Set the output style. (values: [${VALID_STYLES.join(
            ', ',
          )}], default: interface)\n` +
          '  --url        Set the database connection string URL. This may point to an environment variable. (default: env(DATABASE_URL))\n',
      );
      process.exit(0);
    }

    if (!VALID_DRIVERS.includes(driver)) {
      throw new RangeError(
        `Parameter '--driver' must have one of the following values: ${VALID_DRIVERS.join(
          ', ',
        )}`,
      );
    }

    if (!VALID_STYLES.includes(style)) {
      throw new RangeError(
        `Parameter '--style' must have one of the following values: ${VALID_STYLES.join(
          ', ',
        )}`,
      );
    }

    if (!url) {
      throw new TypeError(
        "Parameter '--url' must be a valid connection string. Examples:\n\n" +
          '  --url=postgres://username:password@mydomain.com/database\n' +
          '  --url=env(DATABASE_URL)',
      );
    }

    await generate({ driver, logLevel, outFile, print, style, url });
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

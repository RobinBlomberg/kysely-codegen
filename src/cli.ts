#!/usr/bin/env node
import minimist from 'minimist';
import { generate } from './generate';

const DEFAULT_OUT_FILE = './node_modules/kysely-codegen/dist/index.d.ts';

(async () => {
  try {
    const {
      _,
      driver = 'pg',
      h,
      help,
      outFile = './node_modules/kysely-codegen/dist/index.d.ts',
      style = 'interface',
      url = 'env(DATABASE_URL)',
    } = minimist(process.argv.slice(2));

    if (h || help || _.includes('-h') || _.includes('--help')) {
      console.info(
        '\n' +
          'kysely-codegen <options>\n' +
          '\n' +
          '  --driver    Set the SQL driver. (values: [pg], default: pg)\n' +
          '  --help, -h  Print this message.\n' +
          `  --outFile   Set the file build path. (default: ${DEFAULT_OUT_FILE})\n` +
          '  --style     Set the output style. (values: [interface, type], default: interface)\n' +
          '  --url       Set the database connection string URL. This may point to an environment variable. (default: env(DATABASE_URL))\n',
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
          '--url=postgres://username:password@mydomain.com/database\n' +
          '--url=env(DATABASE_URL)',
      );
    }

    await generate({ driver, outFile, style, url });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`\nError: ${error.message}`);
      process.exit(0);
    } else {
      throw error;
    }
  }
})();

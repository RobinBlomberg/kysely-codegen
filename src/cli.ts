#!/usr/bin/env node
import minimist from 'minimist';
import { generate } from './generate';

(async () => {
  try {
    const {
      driver = 'pg',
      outFile = './node_modules/kysely-codegen/dist/index.d.ts',
      style = 'interface',
      url = 'env(DATABASE_URL)',
    } = minimist(process.argv.slice(2));

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

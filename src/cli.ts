#!/usr/bin/env node
import minimist from 'minimist';
import { CodegenDialectName } from './dialect-manager';
import { CodegenFormat } from './enums/format';
import { getLogLevel, LogLevel } from './enums/log-level';
import { CodegenGenerator } from './generator';
import { Logger } from './logger';

const DEFAULT_OUT_FILE = './node_modules/kysely-codegen/dist/index.d.ts';
const VALID_DIALECTS = ['postgres', 'sqlite'];
const VALID_FORMATS = ['interface', 'type'];

const VALID_FLAGS = new Set([
  '_',
  'dialect',
  'format',
  'h',
  'help',
  'log-level',
  'out-file',
  'print',
  'url',
]);

class CodegenCli {
  #parseOptions(args: string[]) {
    const argv = minimist(args);

    const _: string[] = argv._;
    const dialectName = argv.dialect as CodegenDialectName | undefined;
    const format = (argv.format as CodegenFormat) ?? CodegenFormat.INTERFACE;
    const help =
      !!argv.h || !!argv.help || _.includes('-h') || _.includes('--help');
    const logLevel = getLogLevel(argv['log-level']);
    const outFile = (argv['out-file'] as string) ?? DEFAULT_OUT_FILE;
    const print = !!argv.print;
    const url = (argv.url as string) ?? 'env(DATABASE_URL)';

    const logger = new Logger(logLevel);

    try {
      for (const key in argv) {
        if (!VALID_FLAGS.has(key)) {
          throw new RangeError(`Invalid flag: "${key}"`);
        }
      }

      const dialectValues = VALID_DIALECTS.join(', ');
      const formatValues = VALID_FORMATS.join(', ');

      if (help) {
        logger.log(
          '\n' +
            'kysely-codegen [options]\n' +
            '\n' +
            `  --dialect    Set the SQL dialect. (values: [${dialectValues}])\n` +
            `  --format     Set the output format. (values: [${formatValues}], default: interface)\n` +
            '  --help, -h   Print this message.\n' +
            '  --log-level  Set the terminal log level. (values: [debug, info, warn, error, silent], default: warn)\n' +
            `  --out-file   Set the file build path. (default: ${DEFAULT_OUT_FILE})\n` +
            '  --print      Print the generated output to the terminal.\n' +
            '  --url        Set the database connection string URL. This may point to an environment variable. (default: env(DATABASE_URL))\n',
        );

        process.exit(0);
      }

      if (dialectName && !VALID_DIALECTS.includes(dialectName)) {
        throw new RangeError(
          `Parameter '--dialect' must have one of the following values: ${dialectValues}`,
        );
      }

      if (!VALID_FORMATS.includes(format)) {
        throw new RangeError(
          `Parameter '--format' must have one of the following values: ${formatValues}`,
        );
      }

      if (!url) {
        throw new TypeError(
          "Parameter '--url' must be a valid connection string. Examples:\n\n" +
            '  --url=postgres://username:password@mydomain.com/database\n' +
            '  --url=env(DATABASE_URL)',
        );
      }
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

    return {
      dialectName,
      format,
      logLevel,
      outFile,
      print,
      url,
    };
  }

  async #generate(options: {
    dialectName: CodegenDialectName | undefined;
    format: CodegenFormat;
    logLevel: LogLevel;
    outFile: string;
    print: boolean;
    url: string;
  }) {
    const generator = new CodegenGenerator(options);
    await generator.generate();
  }

  async run() {
    const options = this.#parseOptions(process.argv.slice(2));
    await this.#generate(options);
  }
}

const cli = new CodegenCli();

void cli.run();

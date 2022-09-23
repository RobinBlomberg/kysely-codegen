import minimist from 'minimist';
import { ConnectionStringParser } from './connection-string-parser';
import { DialectManager, DialectName } from './dialect-manager';
import { LogLevel } from './enums/log-level';
import { Generator } from './generator';
import { Logger } from './logger';

const DEFAULT_OUT_FILE = './node_modules/kysely-codegen/dist/db.d.ts';
const VALID_DIALECTS = ['mysql', 'postgres', 'sqlite'];
const VALID_FLAGS = new Set([
  '_',
  'camel-case',
  'dialect',
  'exclude-pattern',
  'h',
  'help',
  'include-pattern',
  'log-level',
  'out-file',
  'print',
  'url',
]);

export type CliOptions = {
  camelCase: boolean;
  dialectName: DialectName | undefined;
  excludePattern: string | undefined;
  includePattern: string | undefined;
  logLevel: LogLevel;
  outFile: string;
  print: boolean;
  url: string;
};

/**
 * Creates a kysely-codegen command-line interface.
 */
export class Cli {
  async #generate(options: CliOptions) {
    const { camelCase } = options;

    const logger = new Logger(options.logLevel);

    const connectionStringParser = new ConnectionStringParser();
    const { connectionString, inferredDialectName } =
      connectionStringParser.parse({
        connectionString: options.url,
        dialectName: options.dialectName,
        logger,
      });

    if (options.dialectName) {
      logger.info(`Using dialect '${options.dialectName}'.`);
    } else {
      logger.info(`No dialect specified. Assuming '${inferredDialectName}'.`);
    }

    const dialectManager = new DialectManager();
    const dialect = dialectManager.getDialect(
      options.dialectName ?? inferredDialectName,
    );

    const generator = new Generator({
      camelCase,
      connectionString,
      dialect,
      logger,
    });
    await generator.generate(options);
  }

  #getLogLevel(name?: 'silent' | 'info' | 'warn' | 'error' | 'debug') {
    switch (name) {
      case 'silent':
        return LogLevel.SILENT;
      case 'info':
        return LogLevel.INFO;
      case 'error':
        return LogLevel.ERROR;
      case 'debug':
        return LogLevel.DEBUG;
      default:
        return LogLevel.WARN;
    }
  }

  #parseOptions(args: string[]): CliOptions {
    const argv = minimist(args);

    const _: string[] = argv._;
    const camelCase = !!argv['camel-case'];
    const dialectName = argv.dialect as DialectName | undefined;
    const help =
      !!argv.h || !!argv.help || _.includes('-h') || _.includes('--help');
    const excludePattern = argv['exclude-pattern'] as string | undefined;
    const includePattern = argv['include-pattern'] as string | undefined;
    const logLevel = this.#getLogLevel(argv['log-level']);
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

      if (help) {
        logger.log(
          '',
          'kysely-codegen [options]',
          '',
          '  --all              Display all options.',
          '  --camel-case       Use the Kysely CamelCasePlugin.',
          `  --dialect          Set the SQL dialect. (values: [${dialectValues}])`,
          '  --help, -h         Print this message.',
          '  --exclude-pattern  Exclude tables matching the specified glob pattern. (examples: users, *.table, secrets.*, *._*)',
          '  --include-pattern  Only include tables matching the specified glob pattern. (examples: users, *.table, secrets.*, *._*)',
          '  --log-level        Set the terminal log level. (values: [debug, info, warn, error, silent], default: warn)',
          `  --out-file         Set the file build path. (default: ${DEFAULT_OUT_FILE})`,
          '  --print            Print the generated output to the terminal.',
          '  --url              Set the database connection string URL. This may point to an environment variable. (default: env(DATABASE_URL))',
          '',
        );

        process.exit(0);
      }

      if (dialectName && !VALID_DIALECTS.includes(dialectName)) {
        throw new RangeError(
          `Parameter '--dialect' must have one of the following values: ${dialectValues}`,
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
      camelCase,
      dialectName,
      excludePattern,
      includePattern,
      logLevel,
      outFile,
      print,
      url,
    };
  }

  async run(argv: string[]) {
    const options = this.#parseOptions(argv);
    await this.#generate(options);
  }
}

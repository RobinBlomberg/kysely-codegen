import minimist from 'minimist';
import { ConnectionStringParser } from './connection-string-parser';
import {
  DEFAULT_OUT_FILE,
  DEFAULT_URL,
  LOG_LEVEL_NAMES,
  VALID_DIALECTS,
  VALID_FLAGS,
} from './constants';
import { DialectManager, DialectName } from './dialect-manager';
import { LogLevel } from './enums';
import { Generator } from './generator';
import { Logger } from './logger';

export type CliOptions = {
  camelCase: boolean;
  dialectName: DialectName | undefined;
  excludePattern: string | undefined;
  includePattern: string | undefined;
  logLevel: LogLevel;
  outFile: string | undefined;
  print: boolean;
  url: string;
};

export type LogLevelName = typeof LOG_LEVEL_NAMES[number];

/**
 * Creates a kysely-codegen command-line interface.
 */
export class Cli {
  async #generate(options: CliOptions) {
    const camelCase = !!options.camelCase;
    const outFile = options.outFile;

    const logger = new Logger(options.logLevel);

    const connectionStringParser = new ConnectionStringParser();
    const { connectionString, inferredDialectName } =
      connectionStringParser.parse({
        connectionString: options.url ?? DEFAULT_URL,
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

    const generator = new Generator();

    await generator.generate({
      camelCase,
      connectionString,
      dialect,
      logger,
      outFile,
    });
  }

  #getLogLevel(name?: LogLevelName) {
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
    const outFile =
      (argv['out-file'] as string | undefined) ??
      (argv.print ? undefined : DEFAULT_OUT_FILE);
    const print = !!argv.print;
    const url = (argv.url as string) ?? DEFAULT_URL;

    try {
      for (const key in argv) {
        if (!VALID_FLAGS.has(key)) {
          throw new RangeError(`Invalid flag: "${key}"`);
        }
      }

      const dialectValues = VALID_DIALECTS.join(', ');

      if (help) {
        console.info([
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
          `  --url              Set the database connection string URL. This may point to an environment variable. (default: ${DEFAULT_URL})`,
          '',
        ].join('\n'));

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
          console.error(new Logger().serializeError(error.message));

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

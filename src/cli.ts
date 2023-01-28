import minimist from 'minimist';
import { ConnectionStringParser } from './connection-string-parser';
import {
  DEFAULT_LOG_LEVEL,
  DEFAULT_OUT_FILE,
  DEFAULT_URL,
  FLAGS,
  LOG_LEVEL_NAMES,
  VALID_DIALECTS,
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
  schema: string | undefined;
  typeOnlyImports: boolean;
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
    const excludePattern = options.excludePattern;
    const includePattern = options.includePattern;
    const schema = options.schema;
    const typeOnlyImports = options.typeOnlyImports;

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

    const db = await dialect.introspector.connect({
      connectionString,
      dialect,
    });

    const generator = new Generator();

    await generator.generate({
      camelCase,
      db,
      dialect,
      excludePattern,
      includePattern,
      logger,
      outFile,
      schema,
      typeOnlyImports,
    });

    await db.destroy();
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
      case 'warn':
        return LogLevel.WARN;
      default:
        return DEFAULT_LOG_LEVEL;
    }
  }

  #parseBoolean(input?: boolean | string) {
    return !!input && input !== 'false';
  }

  #serializeFlags() {
    const lines: { description: string; line: string }[] = [];
    let maxLineLength = 0;

    for (const { description, longName, shortName } of FLAGS) {
      let line = `  --${longName}`;

      if (shortName) {
        line += `, -${shortName}`;
      }

      if (line.length > maxLineLength) {
        maxLineLength = line.length;
      }

      lines.push({ description, line });
    }

    return lines.map(({ description, line }) => {
      const padding = ' '.repeat(maxLineLength - line.length + 2);
      return `${line}${padding}${description}`;
    });
  }

  #showHelp() {
    const flagLines = this.#serializeFlags();
    const lines = ['', 'kysely-codegen [options]', '', ...flagLines, ''];
    console.info(lines.join('\n'));
    process.exit(0);
  }

  parseOptions(args: string[], options?: { silent?: boolean }): CliOptions {
    const argv = minimist(args);

    const _: string[] = argv._;
    const camelCase = this.#parseBoolean(argv['camel-case']);
    const dialectName = argv.dialect as DialectName | undefined;
    const help =
      !!argv.h || !!argv.help || _.includes('-h') || _.includes('--help');
    const excludePattern = argv['exclude-pattern'] as string | undefined;
    const includePattern = argv['include-pattern'] as string | undefined;
    const logLevel = this.#getLogLevel(argv['log-level']);
    const outFile =
      (argv['out-file'] as string | undefined) ??
      (argv.print ? undefined : DEFAULT_OUT_FILE);
    const print = this.#parseBoolean(argv.print);
    const schema = argv.schema as string | undefined;
    const typeOnlyImports = this.#parseBoolean(
      argv['type-only-imports'] ?? true,
    );
    const url = (argv.url as string) ?? DEFAULT_URL;

    try {
      for (const key in argv) {
        if (
          key !== '_' &&
          !FLAGS.some((flag) => [flag.longName, flag.shortName].includes(key))
        ) {
          throw new RangeError(`Invalid flag: "${key}"`);
        }
      }

      if (help && !options?.silent) {
        this.#showHelp();
      }

      if (dialectName && !VALID_DIALECTS.includes(dialectName)) {
        const dialectValues = VALID_DIALECTS.join(', ');
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
      schema,
      typeOnlyImports,
      url,
    };
  }

  async run(argv: string[]) {
    const options = this.parseOptions(argv);
    await this.#generate(options);
  }
}

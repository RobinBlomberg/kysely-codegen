import minimist from 'minimist';
import {
  DEFAULT_NUMERIC_PARSER,
  NumericParser,
} from '../../introspector/dialects/postgres/numeric-parser';
import { ConnectionStringParser } from '../core/connection-string-parser';
import type { DialectName } from '../core/dialect-manager';
import { DialectManager } from '../core/dialect-manager';
import { LogLevel } from '../core/log-level';
import { Logger } from '../core/logger';
import type { Overrides } from '../transformer/transformer';
import type { LOG_LEVEL_NAMES } from './constants';
import {
  DEFAULT_LOG_LEVEL,
  DEFAULT_OUT_FILE,
  DEFAULT_URL,
  VALID_DIALECTS,
} from './constants';
import { FLAGS } from './flags';
import { generate } from './generator';

export type CliOptions = {
  camelCase?: boolean;
  dialectName?: DialectName;
  domains?: boolean;
  envFile?: string;
  excludePattern?: string;
  includePattern?: string;
  logLevel?: LogLevel;
  numericParser?: NumericParser;
  outFile?: string;
  overrides?: Overrides;
  partitions?: boolean;
  print?: boolean;
  runtimeEnums?: boolean;
  schema?: string;
  singular?: boolean;
  typeOnlyImports?: boolean;
  url: string;
  verify?: boolean;
};

export type LogLevelName = (typeof LOG_LEVEL_NAMES)[number];

/**
 * Creates a kysely-codegen command-line interface.
 */
export class Cli {
  async generate(options: CliOptions) {
    const camelCase = !!options.camelCase;
    const excludePattern = options.excludePattern;
    const includePattern = options.includePattern;
    const numericParser = options.numericParser;
    const outFile = options.outFile;
    const overrides = options.overrides;
    const partitions = !!options.partitions;
    const print = !!options.print;
    const runtimeEnums = options.runtimeEnums;
    const schema = options.schema;
    const singular = !!options.singular;
    const typeOnlyImports = options.typeOnlyImports;
    const verify = options.verify;

    const logger = new Logger(options.logLevel);

    const connectionStringParser = new ConnectionStringParser();
    const { connectionString, inferredDialectName } =
      connectionStringParser.parse({
        connectionString: options.url ?? DEFAULT_URL,
        dialectName: options.dialectName,
        envFile: options.envFile,
        logger,
      });

    if (options.dialectName) {
      logger.info(`Using dialect '${options.dialectName}'.`);
    } else {
      logger.info(`No dialect specified. Assuming '${inferredDialectName}'.`);
    }

    const dialectManager = new DialectManager({
      domains: !!options.domains,
      numericParser: options.numericParser ?? DEFAULT_NUMERIC_PARSER,
      partitions: !!options.partitions,
    });
    const dialect = dialectManager.getDialect(
      options.dialectName ?? inferredDialectName,
    );

    const db = await dialect.introspector.connect({
      connectionString,
      dialect,
    });

    await generate({
      camelCase,
      db,
      dialect,
      excludePattern,
      includePattern,
      logger,
      numericParser,
      outFile,
      overrides,
      partitions,
      print,
      runtimeEnums,
      schema,
      singular,
      typeOnlyImports,
      verify,
    });

    await db.destroy();
  }

  #parseBoolean(input: any) {
    return !!input && input !== 'false';
  }

  #parseLogLevel(input: any) {
    switch (input) {
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

  #parseNumericParser(input: any) {
    switch (input) {
      case 'number':
        return NumericParser.NUMBER;
      case 'number-or-string':
        return NumericParser.NUMBER_OR_STRING;
      case 'string':
        return NumericParser.STRING;
      default:
        return DEFAULT_NUMERIC_PARSER;
    }
  }

  #parseString(input: any) {
    return input === undefined ? undefined : String(input);
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
    const dialectName = this.#parseString(argv.dialect) as DialectName;
    const domains = this.#parseBoolean(argv.domains);
    const envFile = this.#parseString(argv['env-file']);
    const excludePattern = this.#parseString(argv['exclude-pattern']);
    const help =
      !!argv.h || !!argv.help || _.includes('-h') || _.includes('--help');
    const includePattern = this.#parseString(argv['include-pattern']);
    const logLevel = this.#parseLogLevel(argv['log-level']);
    const numericParser = this.#parseNumericParser(argv['numeric-parser']);
    const outFile =
      this.#parseString(argv['out-file']) ??
      (argv.print ? undefined : DEFAULT_OUT_FILE);
    const overrides = argv.overrides ? JSON.parse(argv.overrides) : undefined;
    const partitions = this.#parseBoolean(argv.partitions);
    const print = this.#parseBoolean(argv.print);
    const runtimeEnums = this.#parseBoolean(argv['runtime-enums']);
    const schema = this.#parseString(argv.schema);
    const singular = this.#parseBoolean(argv.singular);
    const typeOnlyImports = this.#parseBoolean(
      argv['type-only-imports'] ?? true,
    );
    const url = this.#parseString(argv.url) ?? DEFAULT_URL;
    const verify = this.#parseBoolean(argv.verify);

    try {
      for (const key in argv) {
        if (
          key !== '_' &&
          !FLAGS.some((flag) => {
            return [
              flag.shortName,
              flag.longName,
              ...(flag.longName.startsWith('no-')
                ? [flag.longName.slice(3)]
                : []),
            ].includes(key);
          })
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
      domains,
      envFile,
      excludePattern,
      includePattern,
      logLevel,
      numericParser,
      outFile,
      overrides,
      partitions,
      print,
      runtimeEnums,
      schema,
      singular,
      typeOnlyImports,
      url,
      verify,
    };
  }

  async run(argv: string[]) {
    const options = this.parseOptions(argv);
    await this.generate(options);
  }
}

import minimist from 'minimist';
import { ConnectionStringParser } from '../generator/connection-string-parser';
import type { DialectName } from '../generator/dialect-manager';
import { DialectManager } from '../generator/dialect-manager';
import { generate } from '../generator/generator/generate';
import { RuntimeEnumsStyle } from '../generator/generator/runtime-enums-style';
import { LogLevel } from '../generator/logger/log-level';
import { Logger } from '../generator/logger/logger';
import type { Overrides } from '../generator/transformer/transform';
import {
  DateParser,
  DEFAULT_DATE_PARSER,
} from '../introspector/dialects/postgres/date-parser';
import {
  DEFAULT_NUMERIC_PARSER,
  NumericParser,
} from '../introspector/dialects/postgres/numeric-parser';
import {
  DEFAULT_LOG_LEVEL,
  DEFAULT_OUT_FILE,
  DEFAULT_URL,
  VALID_DIALECTS,
} from './constants';
import { FLAGS, serializeFlags } from './flags';

export type CliOptions = {
  camelCase?: boolean;
  dateParser?: DateParser;
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
  runtimeEnumsStyle?: RuntimeEnumsStyle;
  schemas?: string[];
  singular?: boolean;
  typeOnlyImports?: boolean;
  url: string;
  verify?: boolean;
};

/**
 * Creates a kysely-codegen command-line interface.
 */
export class Cli {
  logLevel = DEFAULT_LOG_LEVEL;

  async generate(options: CliOptions) {
    const camelCase = !!options.camelCase;
    const excludePattern = options.excludePattern;
    const includePattern = options.includePattern;
    const outFile = options.outFile;
    const overrides = options.overrides;
    const partitions = !!options.partitions;
    const print = !!options.print;
    const runtimeEnums = options.runtimeEnums;
    const runtimeEnumsStyle = options.runtimeEnumsStyle;
    const schemas = options.schemas;
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
      dateParser: options.dateParser ?? DEFAULT_DATE_PARSER,
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
      outFile,
      overrides,
      partitions,
      print,
      runtimeEnums,
      runtimeEnumsStyle,
      schemas,
      singular,
      typeOnlyImports,
      verify,
    });

    await db.destroy();
  }

  #parseBoolean(input: any) {
    return !!input && input !== 'false';
  }

  #parseDateParser(input: any) {
    switch (input) {
      case 'string':
        return DateParser.STRING;
      case 'timestamp':
        return DateParser.TIMESTAMP;
      default:
        return DEFAULT_DATE_PARSER;
    }
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

  #parseRuntimeEnumsStyle(input: any) {
    switch (input) {
      case 'pascal-case':
        return RuntimeEnumsStyle.PASCAL_CASE;
      case 'screaming-snake-case':
        return RuntimeEnumsStyle.SCREAMING_SNAKE_CASE;
    }
  }

  #parseString(input: any) {
    return input === undefined ? undefined : String(input);
  }

  #parseStringArray(input: any) {
    if (input === undefined) return [];
    if (!Array.isArray(input)) return [String(input)];
    return input.map(String);
  }

  #showHelp() {
    console.info(
      ['', 'kysely-codegen [options]', '', serializeFlags(FLAGS), ''].join(
        '\n',
      ),
    );
    process.exit(0);
  }

  parseOptions(args: string[], options?: { silent?: boolean }): CliOptions {
    const argv = minimist(args);
    const logLevel = (this.logLevel = this.#parseLogLevel(argv['log-level']));

    const _: string[] = argv._;
    const camelCase = this.#parseBoolean(argv['camel-case']);
    const dateParser = this.#parseDateParser(argv['date-parser']);
    const dialectName = this.#parseString(argv.dialect) as DialectName;
    const domains = this.#parseBoolean(argv.domains);
    const envFile = this.#parseString(argv['env-file']);
    const excludePattern = this.#parseString(argv['exclude-pattern']);
    const help =
      !!argv.h || !!argv.help || _.includes('-h') || _.includes('--help');
    const includePattern = this.#parseString(argv['include-pattern']);
    const numericParser = this.#parseNumericParser(argv['numeric-parser']);
    const outFile =
      this.#parseString(argv['out-file']) ??
      (argv.print ? undefined : DEFAULT_OUT_FILE);
    const overrides = argv.overrides ? JSON.parse(argv.overrides) : undefined;
    const partitions = this.#parseBoolean(argv.partitions);
    const print = this.#parseBoolean(argv.print);
    const runtimeEnums = this.#parseBoolean(argv['runtime-enums']);
    const runtimeEnumsStyle = this.#parseRuntimeEnumsStyle(
      argv['runtime-enums-style'],
    );
    const schemas = this.#parseStringArray(argv.schema);
    const singular = this.#parseBoolean(argv.singular);
    const typeOnlyImports = this.#parseBoolean(
      argv['type-only-imports'] ?? true,
    );
    const url = this.#parseString(argv.url) ?? DEFAULT_URL;
    const verify = this.#parseBoolean(argv.verify);

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

    return {
      camelCase,
      dateParser,
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
      runtimeEnumsStyle,
      schemas,
      singular,
      typeOnlyImports,
      url,
      verify,
    };
  }

  async run(argv: string[]) {
    try {
      const options = this.parseOptions(argv);
      await this.generate(options);
    } catch (error) {
      if (this.logLevel > LogLevel.SILENT) {
        if (error instanceof Error) {
          if (this.logLevel >= LogLevel.DEBUG) {
            console.error();
            throw error;
          } else {
            console.error(new Logger().serializeError(error.message));
            process.exit(0);
          }
        } else {
          throw error;
        }
      }
    }
  }
}

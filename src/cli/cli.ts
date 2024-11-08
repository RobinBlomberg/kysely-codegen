import console from 'console';
import { cosmiconfigSync } from 'cosmiconfig';
import minimist from 'minimist';
import { resolve } from 'path';
import { z } from 'zod';
import { getDialect } from '../generator';
import { ConnectionStringParser } from '../generator/connection-string-parser';
import { generate } from '../generator/generator/generate';
import { RuntimeEnumsStyle } from '../generator/generator/runtime-enums-style';
import {
  DEFAULT_LOG_LEVEL,
  LogLevel,
  matchesLogLevel,
} from '../generator/logger/log-level';
import { Logger } from '../generator/logger/logger';
import { DateParser } from '../introspector/dialects/postgres/date-parser';
import { NumericParser } from '../introspector/dialects/postgres/numeric-parser';
import { ConfigError } from './config-error';
import { DEFAULT_URL, VALID_DIALECTS } from './constants';
import { FLAGS, serializeFlags } from './flags';

export type CliGenerateOptions = z.infer<typeof cliGenerateOptionsSchema>;

const dialectSchema = z.enum([
  'bun-sqlite',
  'kysely-bun-sqlite',
  'libsql',
  'mssql',
  'mysql',
  'postgres',
  'sqlite',
  'worker-bun-sqlite',
]);

const cliGenerateOptionsSchema = z.object({
  camelCase: z.boolean().optional(),
  dateParser: z.nativeEnum(DateParser).optional(),
  defaultSchemas: z.array(z.string()).optional(),
  dialect: dialectSchema.optional(),
  domains: z.boolean().optional(),
  envFile: z.string().optional(),
  excludePattern: z.string().nullable().optional(),
  includePattern: z.string().nullable().optional(),
  logLevel: z.nativeEnum(LogLevel).optional(),
  numericParser: z.nativeEnum(NumericParser).optional(),
  outFile: z.string().nullable().optional(),
  overrides: z
    .object({ columns: z.record(z.string(), z.any()).optional() })
    .optional(),
  partitions: z.boolean().optional(),
  print: z.boolean().optional(),
  runtimeEnums: z
    .union([z.boolean(), z.nativeEnum(RuntimeEnumsStyle)])
    .optional(),
  singularize: z
    .union([z.boolean(), z.record(z.string(), z.string())])
    .optional(),
  typeOnlyImports: z.boolean().optional(),
  url: z.string().optional(),
  verify: z.boolean().optional(),
});

const compact = <T extends Record<string, unknown>>(object: T) => {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined),
  ) as T;
};

/**
 * Creates a kysely-codegen command-line interface.
 */
export class Cli {
  logLevel = DEFAULT_LOG_LEVEL;

  async generate(options: CliGenerateOptions) {
    const connectionStringParser = new ConnectionStringParser();
    const logger = new Logger(options.logLevel);

    const { connectionString, dialect: dialectName } =
      connectionStringParser.parse({
        connectionString: options.url ?? DEFAULT_URL,
        dialect: options.dialect,
        envFile: options.envFile,
        logger,
      });

    if (options.dialect) {
      logger.info(`Using dialect '${options.dialect}'.`);
    } else {
      logger.info(`No dialect specified. Assuming '${dialectName}'.`);
    }

    const dialect = getDialect(dialectName, {
      dateParser: options.dateParser,
      domains: options.domains,
      numericParser: options.numericParser,
      partitions: options.partitions,
    });

    const db = await dialect.introspector.connect({
      connectionString,
      dialect,
    });

    const output = await generate({
      camelCase: options.camelCase,
      db,
      defaultSchemas: options.defaultSchemas,
      dialect,
      excludePattern: options.excludePattern,
      includePattern: options.includePattern,
      logger,
      outFile: options.outFile,
      overrides: options.overrides,
      partitions: options.partitions,
      print: options.print,
      runtimeEnums: options.runtimeEnums,
      singularize: options.singularize,
      typeOnlyImports: options.typeOnlyImports,
      verify: options.verify,
    });

    await db.destroy();

    return output;
  }

  #loadConfig(config?: {
    configFile?: string;
  }): { config: unknown; filepath: string } | null {
    const explorer = cosmiconfigSync('kysely-codegen');
    return config?.configFile
      ? explorer.load(config.configFile)
      : explorer.search();
  }

  #parseBoolean(input: any) {
    if (input === undefined) return undefined;
    return !!input && input !== 'false';
  }

  #parseDateParser(input: any) {
    if (input === undefined) return undefined;
    switch (input) {
      case 'string':
        return DateParser.STRING;
      case 'timestamp':
        return DateParser.TIMESTAMP;
    }
  }

  #parseDialectName(input: any) {
    const result = dialectSchema.safeParse(input);
    return result.success ? result.data : undefined;
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
    }
  }

  #parseNumericParser(input: any) {
    if (input === undefined) return undefined;
    switch (input) {
      case 'number':
        return NumericParser.NUMBER;
      case 'number-or-string':
        return NumericParser.NUMBER_OR_STRING;
      case 'string':
        return NumericParser.STRING;
    }
  }

  #parseRuntimeEnums(input: any) {
    if (input === undefined) return undefined;
    switch (input) {
      case 'pascal-case':
        return RuntimeEnumsStyle.PASCAL_CASE;
      case 'screaming-snake-case':
        return RuntimeEnumsStyle.SCREAMING_SNAKE_CASE;
      default:
        return this.#parseBoolean(input);
    }
  }

  #parseString(input: any) {
    if (input === undefined) return undefined;
    return String(input);
  }

  #parseStringArray(input: any) {
    if (input === undefined) return undefined;
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

  parseOptions(
    args: string[],
    options?: { config?: CliGenerateOptions; silent?: boolean },
  ): CliGenerateOptions {
    const argv = minimist(args);
    const logLevel = this.#parseLogLevel(argv['log-level']);

    if (logLevel !== undefined) {
      this.logLevel = logLevel;
    }

    for (const key in argv) {
      if (key === 'schema') {
        throw new RangeError(
          `The flag '${key}' has been deprecated. Use 'default-schema' instead.`,
        );
      }

      if (key === 'singular') {
        throw new RangeError(
          `The flag '${key}' has been deprecated. Use 'singularize' instead.`,
        );
      }

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
        throw new RangeError(`Invalid flag: '${key}'`);
      }
    }

    const _: string[] = argv._;
    const help =
      !!argv.h || !!argv.help || _.includes('-h') || _.includes('--help');

    if (help && !options?.silent) {
      this.#showHelp();
      process.exit(1);
    }

    const configFile = this.#parseString(argv['config-file']);
    const configResult = options?.config
      ? { config: options.config, filepath: null }
      : this.#loadConfig({ configFile });

    const configParseResult = configResult
      ? cliGenerateOptionsSchema.safeParse(configResult.config)
      : null;

    if (configParseResult?.error) {
      throw new ConfigError(configParseResult.error.errors[0]!);
    }

    const config = configParseResult?.data;
    const configOptions = config
      ? compact({
          ...config,
          ...(configResult?.filepath && config.outFile
            ? { outFile: resolve(configResult.filepath, '..', config.outFile) }
            : {}),
        })
      : {};

    const cliOptions = compact({
      camelCase: this.#parseBoolean(argv['camel-case']),
      dateParser: this.#parseDateParser(argv['date-parser']),
      defaultSchemas: this.#parseStringArray(argv['default-schema']),
      dialect: this.#parseDialectName(argv.dialect),
      domains: this.#parseBoolean(argv.domains),
      envFile: this.#parseString(argv['env-file']),
      excludePattern: this.#parseString(argv['exclude-pattern']),
      includePattern: this.#parseString(argv['include-pattern']),
      logLevel,
      numericParser: this.#parseNumericParser(argv['numeric-parser']),
      outFile: this.#parseString(argv['out-file']),
      overrides:
        typeof argv.overrides === 'string'
          ? JSON.parse(argv.overrides)
          : undefined,
      partitions: this.#parseBoolean(argv.partitions),
      print: this.#parseBoolean(argv.print),
      runtimeEnums: this.#parseRuntimeEnums(argv['runtime-enums']),
      singularize: this.#parseBoolean(argv.singularize),
      typeOnlyImports: this.#parseBoolean(argv['type-only-imports']),
      url: this.#parseString(argv.url),
      verify: this.#parseBoolean(argv.verify),
    });

    const print = cliOptions.print ?? configOptions.print;
    const outFile = print
      ? undefined
      : (cliOptions.outFile ?? configOptions.outFile);

    const generateOptions: CliGenerateOptions = {
      ...configOptions,
      ...cliOptions,
      ...(logLevel === undefined ? {} : { logLevel }),
      ...(outFile === undefined ? {} : { outFile }),
    };

    if (
      generateOptions.dialect &&
      !VALID_DIALECTS.includes(generateOptions.dialect)
    ) {
      const dialectValues = VALID_DIALECTS.join(', ');
      throw new RangeError(
        `Parameter '--dialect' must have one of the following values: ${dialectValues}`,
      );
    }

    return generateOptions;
  }

  async run(options?: { argv?: string[]; config?: CliGenerateOptions }) {
    try {
      const generateOptions = this.parseOptions(options?.argv ?? [], {
        config: options?.config,
      });
      return await this.generate(generateOptions);
    } catch (error) {
      if (matchesLogLevel(this.logLevel, LogLevel.INFO)) {
        if (error instanceof Error) {
          if (matchesLogLevel(this.logLevel, LogLevel.DEBUG)) {
            console.error();
            throw error;
          } else {
            console.error(new Logger().serializeError(error.message));
            process.exit(1);
          }
        } else {
          throw error;
        }
      }
    }
  }
}

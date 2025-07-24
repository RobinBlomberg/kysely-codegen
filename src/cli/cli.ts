import { cosmiconfigSync } from 'cosmiconfig';
import minimist from 'minimist';
import { resolve } from 'node:path';
import type { RuntimeEnumsStyle } from '../generator';
import { getDialect } from '../generator';
import { ConnectionStringParser } from '../generator/connection-string-parser';
import { generate } from '../generator/generator/generate';
import { DEFAULT_LOG_LEVEL } from '../generator/logger/log-level';
import { Logger } from '../generator/logger/logger';
import type { TimestampParser } from '../introspector';
import type { DateParser } from '../introspector/dialects/postgres/date-parser';
import type { NumericParser } from '../introspector/dialects/postgres/numeric-parser';
import type { Config, DialectName } from './config';
import { configSchema, dialectNameSchema } from './config';
import { ConfigError } from './config-error';
import { DEFAULT_URL, VALID_DIALECTS } from './constants';
import { FLAGS, serializeFlags } from './flags';

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

  async generate(options: Config) {
    const connectionStringParser = new ConnectionStringParser();
    const logger = options.logger ?? new Logger(options.logLevel);

    logger.debug('Options:');
    logger.debug(options);
    logger.debug();

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
      timestampParser: options.timestampParser,
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
      serializer: options.serializer,
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

  #parseBoolean(input: any): boolean | undefined {
    if (input === undefined) return undefined;
    return !!input && input !== 'false';
  }

  #parseDateParser(input: any): DateParser | undefined {
    if (input === undefined) return undefined;
    switch (input) {
      case 'string':
      case 'timestamp':
        return input;
    }
  }

  #parseDialectName(input: any): DialectName | undefined {
    const result = dialectNameSchema.safeParse(input);
    return result.success ? result.data : undefined;
  }

  #parseNumericParser(input: any): NumericParser | undefined {
    if (input === undefined) return undefined;
    switch (input) {
      case 'number':
      case 'number-or-string':
      case 'string':
        return input;
    }
  }

  #parseRuntimeEnums(input: any): RuntimeEnumsStyle | boolean | undefined {
    if (input === undefined) return undefined;
    switch (input) {
      case 'pascal-case':
      case 'screaming-snake-case':
        return input;
      default:
        return this.#parseBoolean(input);
    }
  }

  #parseString(input: any): string | undefined {
    if (input === undefined) return undefined;
    return String(input);
  }

  #parseStringArray(input: any): string[] | undefined {
    if (input === undefined) return undefined;
    if (!Array.isArray(input)) return [String(input)];
    return input.map(String);
  }

  #parseTimestampParser(input: any): TimestampParser | undefined {
    if (input === undefined) return undefined;
    switch (input) {
      case 'js-date':
      case 'string':
        return input;
    }
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
    options?: { config?: Config; silent?: boolean },
  ): Config {
    const argv = minimist(args);
    const logLevel = argv['log-level'];

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
      ? configSchema.safeParse(configResult.config)
      : null;
    const configError = configParseResult?.error?.errors[0];

    if (configError) {
      throw new ConfigError(configError);
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

    const cliOptions: Config = compact({
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
      timestampParser: this.#parseTimestampParser(argv['timestamp-parser']),
      typeOnlyImports: this.#parseBoolean(argv['type-only-imports']),
      url: this.#parseString(argv.url),
      verify: this.#parseBoolean(argv.verify),
    });

    const print = cliOptions.print ?? configOptions.print;
    const outFile = print
      ? undefined
      : (cliOptions.outFile ?? configOptions.outFile);

    const generateOptions: Config = {
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

  async run(options?: { argv?: string[]; config?: Config }) {
    const generateOptions = this.parseOptions(options?.argv ?? [], {
      config: options?.config,
    });
    return await this.generate(generateOptions);
  }
}

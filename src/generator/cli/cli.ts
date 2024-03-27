import minimist from 'minimist';
import type { DialectName } from '../../introspector/index.js';
import { parseConnectionString } from '../../introspector/index.js';
import { LogLevel } from '../core/log-level.js';
import { Logger } from '../core/logger.js';
import { generate } from '../generator/generator.js';
import type { LOG_LEVEL_NAMES } from './constants.js';
import {
  DEFAULT_LOG_LEVEL,
  DEFAULT_OUT_FILE,
  DEFAULT_URL,
  VALID_DIALECTS,
} from './constants.js';
import { FLAGS } from './flags.js';

export type CliOptions = {
  camelCase?: boolean;
  dialectName?: DialectName;
  domains?: boolean;
  envFile?: string;
  excludePattern?: string;
  includePattern?: string;
  logLevel?: LogLevel;
  outFile?: string;
  print?: boolean;
  runtimeEnums?: boolean;
  schema?: string;
  typeOnlyImports?: boolean;
  url?: string;
  verify?: boolean;
};

export type LogLevelName = (typeof LOG_LEVEL_NAMES)[number];

const generateFromCli = async (options: CliOptions) => {
  const camelCase = !!options.camelCase;
  const outFile = options.outFile;
  const excludePattern = options.excludePattern;
  const includePattern = options.includePattern;
  const runtimeEnums = options.runtimeEnums;
  const schema = options.schema;
  const typeOnlyImports = options.typeOnlyImports;
  const verify = options.verify;

  const logger = new Logger(options.logLevel);

  const { connectionString, inferredDialectName } = parseConnectionString({
    connectionString: options.url ?? DEFAULT_URL,
    dialectName: options.dialectName,
    envFile: options.envFile,
  });

  logger?.info('Loaded environment variables from .env file.');

  const dialectName = options.dialectName ?? inferredDialectName;

  if (options.dialectName) {
    logger.info(`Using dialect '${options.dialectName}'.`);
  } else {
    logger.info(`No dialect specified. Assuming '${inferredDialectName}'.`);
  }

  await generate({
    camelCase,
    connectionString,
    dialectName,
    excludePattern,
    includePattern,
    logger,
    outFile,
    schema,
    typeOnlyImports,
    verify,
  });
};

const getLogLevel = (name?: LogLevelName) => {
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
};

const parseBoolean = (input?: boolean | string) => {
  return !!input && input !== 'false';
};

const serializeFlags = () => {
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
};

const showHelp = () => {
  const flagLines = serializeFlags();
  const lines = ['', 'kysely-codegen [options]', '', ...flagLines, ''];
  console.info(lines.join('\n'));
  process.exit(0);
};

export const parseCliOptions = (
  args: string[],
  options?: { silent?: boolean },
): CliOptions => {
  const argv = minimist(args);

  const _: string[] = argv._;
  const camelCase = parseBoolean(argv['camel-case']);
  const dialectName = argv.dialect;
  const domains = parseBoolean(argv.domains);
  const envFile = argv['env-file'] as string | undefined;
  const excludePattern = argv['exclude-pattern'] as string | undefined;
  const help =
    !!argv.h || !!argv.help || _.includes('-h') || _.includes('--help');
  const includePattern = argv['include-pattern'] as string | undefined;
  const logLevel = getLogLevel(argv['log-level']);
  const outFile =
    (argv['out-file'] as string | undefined) ??
    (argv.print ? undefined : DEFAULT_OUT_FILE);
  const print = parseBoolean(argv.print);
  const runtimeEnums = parseBoolean(argv['runtime-enums']);
  const schema = argv.schema as string | undefined;
  const typeOnlyImports = parseBoolean(argv['type-only-imports'] ?? true);
  const url = (argv.url as string) ?? DEFAULT_URL;
  const verify = parseBoolean(argv.verify ?? false);

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
      showHelp();
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
    outFile,
    print,
    runtimeEnums,
    schema,
    typeOnlyImports,
    url,
    verify,
  };
};

export const runCli = async (argv: string[]) => {
  const options = parseCliOptions(argv);
  await generateFromCli(options);
};

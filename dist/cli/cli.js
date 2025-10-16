"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Cli_instances, _Cli_loadConfig, _Cli_parseBoolean, _Cli_parseDateParser, _Cli_parseDialectName, _Cli_parseNumericParser, _Cli_parseRuntimeEnums, _Cli_parseString, _Cli_parseStringArray, _Cli_showHelp;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cli = void 0;
const cosmiconfig_1 = require("cosmiconfig");
const minimist_1 = __importDefault(require("minimist"));
const node_path_1 = require("node:path");
const generator_1 = require("../generator");
const connection_string_parser_1 = require("../generator/connection-string-parser");
const generate_1 = require("../generator/generator/generate");
const log_level_1 = require("../generator/logger/log-level");
const logger_1 = require("../generator/logger/logger");
const config_1 = require("./config");
const config_error_1 = require("./config-error");
const constants_1 = require("./constants");
const flags_1 = require("./flags");
const compact = (object) => {
    return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));
};
/**
 * Creates a kysely-codegen command-line interface.
 */
class Cli {
    constructor() {
        _Cli_instances.add(this);
        this.logLevel = log_level_1.DEFAULT_LOG_LEVEL;
    }
    async generate(options) {
        const connectionStringParser = new connection_string_parser_1.ConnectionStringParser();
        const logger = options.logger ?? new logger_1.Logger(options.logLevel);
        logger.debug('Options:');
        logger.debug(options);
        logger.debug();
        const { connectionString, dialect: dialectName } = connectionStringParser.parse({
            connectionString: options.url ?? constants_1.DEFAULT_URL,
            dialect: options.dialect,
            envFile: options.envFile,
            logger,
        });
        if (options.dialect) {
            logger.info(`Using dialect '${options.dialect}'.`);
        }
        else {
            logger.info(`No dialect specified. Assuming '${dialectName}'.`);
        }
        const dialect = (0, generator_1.getDialect)(dialectName, {
            dateParser: options.dateParser,
            domains: options.domains,
            numericParser: options.numericParser,
            partitions: options.partitions,
        });
        const db = await dialect.introspector.connect({
            connectionString,
            dialect,
        });
        const output = await (0, generate_1.generate)({
            camelCase: options.camelCase,
            customImports: options.customImports,
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
            typeMapping: options.typeMapping,
            typeOnlyImports: options.typeOnlyImports,
            verify: options.verify,
        });
        await db.destroy();
        return output;
    }
    parseOptions(args, options) {
        const argv = (0, minimist_1.default)(args);
        const logLevel = argv['log-level'];
        if (logLevel !== undefined) {
            this.logLevel = logLevel;
        }
        for (const key in argv) {
            if (key === 'schema') {
                throw new RangeError(`The flag '${key}' has been deprecated. Use 'default-schema' instead.`);
            }
            if (key === 'singular') {
                throw new RangeError(`The flag '${key}' has been deprecated. Use 'singularize' instead.`);
            }
            if (key !== '_' &&
                !flags_1.FLAGS.some((flag) => {
                    return [
                        flag.shortName,
                        flag.longName,
                        ...(flag.longName.startsWith('no-')
                            ? [flag.longName.slice(3)]
                            : []),
                    ].includes(key);
                })) {
                throw new RangeError(`Invalid flag: '${key}'`);
            }
        }
        const _ = argv._;
        const help = !!argv.h || !!argv.help || _.includes('-h') || _.includes('--help');
        if (help && !options?.silent) {
            __classPrivateFieldGet(this, _Cli_instances, "m", _Cli_showHelp).call(this);
            process.exit(1);
        }
        const configFile = __classPrivateFieldGet(this, _Cli_instances, "m", _Cli_parseString).call(this, argv['config-file']);
        const configResult = options?.config
            ? { config: options.config, filepath: null }
            : __classPrivateFieldGet(this, _Cli_instances, "m", _Cli_loadConfig).call(this, { configFile });
        const configParseResult = configResult
            ? config_1.configSchema.safeParse(configResult.config)
            : null;
        const configError = configParseResult?.error?.issues[0];
        if (configError) {
            throw new config_error_1.ConfigError(configError);
        }
        const config = configParseResult?.data;
        const configOptions = config
            ? compact({
                ...config,
                ...(configResult?.filepath && config.outFile
                    ? { outFile: (0, node_path_1.resolve)(configResult.filepath, '..', config.outFile) }
                    : {}),
            })
            : {};
        const cliOptions = compact({
            camelCase: __classPrivateFieldGet(this, _Cli_instances, "m", _Cli_parseBoolean).call(this, argv['camel-case']),
            customImports: typeof argv['custom-imports'] === 'string'
                ? JSON.parse(argv['custom-imports'])
                : undefined,
            dateParser: __classPrivateFieldGet(this, _Cli_instances, "m", _Cli_parseDateParser).call(this, argv['date-parser']),
            defaultSchemas: __classPrivateFieldGet(this, _Cli_instances, "m", _Cli_parseStringArray).call(this, argv['default-schema']),
            dialect: __classPrivateFieldGet(this, _Cli_instances, "m", _Cli_parseDialectName).call(this, argv.dialect),
            domains: __classPrivateFieldGet(this, _Cli_instances, "m", _Cli_parseBoolean).call(this, argv.domains),
            envFile: __classPrivateFieldGet(this, _Cli_instances, "m", _Cli_parseString).call(this, argv['env-file']),
            excludePattern: __classPrivateFieldGet(this, _Cli_instances, "m", _Cli_parseString).call(this, argv['exclude-pattern']),
            includePattern: __classPrivateFieldGet(this, _Cli_instances, "m", _Cli_parseString).call(this, argv['include-pattern']),
            logLevel,
            numericParser: __classPrivateFieldGet(this, _Cli_instances, "m", _Cli_parseNumericParser).call(this, argv['numeric-parser']),
            outFile: __classPrivateFieldGet(this, _Cli_instances, "m", _Cli_parseString).call(this, argv['out-file']),
            overrides: typeof argv.overrides === 'string'
                ? JSON.parse(argv.overrides)
                : undefined,
            partitions: __classPrivateFieldGet(this, _Cli_instances, "m", _Cli_parseBoolean).call(this, argv.partitions),
            print: __classPrivateFieldGet(this, _Cli_instances, "m", _Cli_parseBoolean).call(this, argv.print),
            runtimeEnums: __classPrivateFieldGet(this, _Cli_instances, "m", _Cli_parseRuntimeEnums).call(this, argv['runtime-enums']),
            singularize: __classPrivateFieldGet(this, _Cli_instances, "m", _Cli_parseBoolean).call(this, argv.singularize),
            typeMapping: typeof argv['type-mapping'] === 'string'
                ? JSON.parse(argv['type-mapping'])
                : undefined,
            typeOnlyImports: __classPrivateFieldGet(this, _Cli_instances, "m", _Cli_parseBoolean).call(this, argv['type-only-imports']),
            url: __classPrivateFieldGet(this, _Cli_instances, "m", _Cli_parseString).call(this, argv.url),
            verify: __classPrivateFieldGet(this, _Cli_instances, "m", _Cli_parseBoolean).call(this, argv.verify),
        });
        const print = cliOptions.print ?? configOptions.print;
        const outFile = print
            ? undefined
            : (cliOptions.outFile ?? configOptions.outFile);
        const generateOptions = {
            ...configOptions,
            ...cliOptions,
            ...(logLevel === undefined ? {} : { logLevel }),
            ...(outFile === undefined ? {} : { outFile }),
        };
        if (generateOptions.dialect &&
            !constants_1.VALID_DIALECTS.includes(generateOptions.dialect)) {
            const dialectValues = constants_1.VALID_DIALECTS.join(', ');
            throw new RangeError(`Parameter '--dialect' must have one of the following values: ${dialectValues}`);
        }
        return generateOptions;
    }
    async run(options) {
        const generateOptions = this.parseOptions(options?.argv ?? [], {
            config: options?.config,
        });
        return await this.generate(generateOptions);
    }
}
exports.Cli = Cli;
_Cli_instances = new WeakSet(), _Cli_loadConfig = function _Cli_loadConfig(config) {
    const explorer = (0, cosmiconfig_1.cosmiconfigSync)('kysely-codegen');
    return config?.configFile
        ? explorer.load(config.configFile)
        : explorer.search();
}, _Cli_parseBoolean = function _Cli_parseBoolean(input) {
    if (input === undefined)
        return undefined;
    return !!input && input !== 'false';
}, _Cli_parseDateParser = function _Cli_parseDateParser(input) {
    switch (input) {
        case 'string':
        case 'timestamp':
            return input;
        default:
            return undefined;
    }
}, _Cli_parseDialectName = function _Cli_parseDialectName(input) {
    const result = config_1.dialectNameSchema.safeParse(input);
    return result.success ? result.data : undefined;
}, _Cli_parseNumericParser = function _Cli_parseNumericParser(input) {
    switch (input) {
        case 'number':
        case 'number-or-string':
        case 'string':
            return input;
        default:
            return undefined;
    }
}, _Cli_parseRuntimeEnums = function _Cli_parseRuntimeEnums(input) {
    if (input === undefined)
        return undefined;
    switch (input) {
        case 'pascal-case':
        case 'screaming-snake-case':
            return input;
        default:
            return __classPrivateFieldGet(this, _Cli_instances, "m", _Cli_parseBoolean).call(this, input);
    }
}, _Cli_parseString = function _Cli_parseString(input) {
    if (input === undefined)
        return undefined;
    return String(input);
}, _Cli_parseStringArray = function _Cli_parseStringArray(input) {
    if (input === undefined)
        return undefined;
    if (!Array.isArray(input))
        return [String(input)];
    return input.map(String);
}, _Cli_showHelp = function _Cli_showHelp() {
    console.info(['', 'kysely-codegen [options]', '', (0, flags_1.serializeFlags)(flags_1.FLAGS), ''].join('\n'));
    process.exit(0);
};
//# sourceMappingURL=cli.js.map
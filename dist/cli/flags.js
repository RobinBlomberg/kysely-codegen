"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeFlags = exports.FLAGS = void 0;
const generator_1 = require("../generator");
const constants_1 = require("./constants");
exports.FLAGS = [
    {
        description: 'Use the Kysely CamelCasePlugin.',
        longName: 'camel-case',
    },
    {
        description: 'Specify the path to the configuration file to use.',
        longName: 'config-file',
    },
    {
        description: 'Specify custom type imports, in JSON format. Use # for named imports.',
        example: '{"InstantRange":"./custom-types","MyType":"./types#OriginalType"}',
        longName: 'custom-imports',
    },
    {
        default: 'timestamp',
        description: 'Specify which parser to use for PostgreSQL date values.',
        longName: 'date-parser',
        values: ['string', 'timestamp'],
    },
    {
        description: 'Set the default schema(s) for the database connection.',
        longName: 'default-schema',
    },
    {
        description: 'Set the SQL dialect.',
        longName: 'dialect',
        values: constants_1.VALID_DIALECTS,
    },
    {
        description: 'Specify the path to an environment file to use.',
        longName: 'env-file',
    },
    {
        description: 'Exclude tables matching the specified glob pattern.',
        examples: ['users', '*.table', 'secrets.*', '*._*'],
        longName: 'exclude-pattern',
    },
    {
        description: 'Print this message.',
        longName: 'help',
        shortName: 'h',
    },
    {
        description: 'Only include tables matching the specified glob pattern.',
        examples: ['users', '*.table', 'secrets.*', '*._*'],
        longName: 'include-pattern',
    },
    {
        default: 'warn',
        description: 'Set the terminal log level.',
        longName: 'log-level',
        values: constants_1.LOG_LEVEL_NAMES,
    },
    {
        description: 'Skip generating types for PostgreSQL domains.',
        longName: 'no-domains',
    },
    {
        default: 'string',
        description: 'Specify which parser to use for PostgreSQL numeric values.',
        longName: 'numeric-parser',
        values: ['string', 'number', 'number-or-string'],
    },
    {
        default: generator_1.DEFAULT_OUT_FILE,
        description: 'Set the file build path.',
        longName: 'out-file',
    },
    {
        description: 'Specify type overrides for specific table columns, in JSON format.',
        example: '{"columns":{"table_name.column_name":"{foo:\\"bar\\"}"}}',
        longName: 'overrides',
    },
    {
        description: 'Include partitions of PostgreSQL tables in the generated code.',
        longName: 'partitions',
    },
    {
        description: 'Print the generated output to the terminal instead of a file.',
        longName: 'print',
    },
    {
        default: constants_1.DEFAULT_RUNTIME_ENUMS_STYLE,
        description: 'Generate runtime enums instead of string unions for PostgreSQL enums.',
        longName: 'runtime-enums',
        values: ['pascal-case', 'screaming-snake-case'],
    },
    {
        description: 'Singularize generated table names, e.g. `BlogPost` instead of `BlogPosts`.',
        longName: 'singularize',
    },
    {
        description: 'Specify type mappings for database types, in JSON format.',
        example: '{"timestamptz":"Temporal.Instant","tstzrange":"InstantRange"}',
        longName: 'type-mapping',
    },
    {
        default: 'true',
        description: 'Generate code using the TypeScript 3.8+ `import type` syntax.',
        longName: 'type-only-imports',
    },
    {
        default: constants_1.DEFAULT_URL,
        description: 'Set the database connection string URL. This may point to an environment variable.',
        longName: 'url',
    },
    {
        description: 'Verify that the generated types are up-to-date.',
        longName: 'verify',
    },
];
const serializeFlags = (flags) => {
    const lines = [];
    const sortedFlags = flags.sort((a, b) => {
        return a.longName.localeCompare(b.longName);
    });
    let maxLineLength = 0;
    for (const flag of sortedFlags) {
        let line = `  --${flag.longName}`;
        if (flag.shortName) {
            line += `, -${flag.shortName}`;
        }
        if (line.length > maxLineLength) {
            maxLineLength = line.length;
        }
        let fullDescription = flag.description;
        const notes = [
            ...(flag.values ? [`values: [${flag.values.join(', ')}]`] : []),
            ...(flag.default ? [`default: ${flag.default}`] : []),
            ...(flag.example ? [`example: ${flag.example}`] : []),
            ...(flag.examples ? [`examples: ${flag.examples.join(', ')}`] : []),
        ];
        if (notes.length > 0) {
            fullDescription += ` (${notes.join(', ')})`;
        }
        lines.push({ fullDescription, line });
    }
    return lines
        .map(({ fullDescription, line }) => {
        const padding = ' '.repeat(maxLineLength - line.length + 2);
        return `${line}${padding}${fullDescription}`;
    })
        .join('\n');
};
exports.serializeFlags = serializeFlags;
//# sourceMappingURL=flags.js.map
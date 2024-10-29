import {
  DEFAULT_OUT_FILE,
  DEFAULT_RUNTIME_ENUMS_STYLE,
  DEFAULT_URL,
  LOG_LEVEL_NAMES,
  VALID_DIALECTS,
} from './constants';

type Flag = {
  default?: string;
  description: string;
  example?: string;
  examples?: string[];
  longName: string;
  shortName?: string;
  values?: readonly string[];
};

export const FLAGS = [
  {
    description: 'Use the Kysely CamelCasePlugin.',
    longName: 'camel-case',
  },
  {
    default: 'timestamp',
    description: 'Specify which parser to use for PostgreSQL date values.',
    longName: 'date-parser',
    values: ['string', 'timestamp'],
  },
  {
    description: 'Set the SQL dialect.',
    longName: 'dialect',
    values: VALID_DIALECTS,
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
    values: LOG_LEVEL_NAMES,
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
    default: DEFAULT_OUT_FILE,
    description: 'Set the file build path.',
    longName: 'out-file',
  },
  {
    description:
      'Specify type overrides for specific table columns, in JSON format.',
    example: '{"columns":{"table_name.column_name":"{foo:\\"bar\\"}"}}',
    longName: 'overrides',
  },
  {
    description:
      'Include partitions of PostgreSQL tables in the generated code.',
    longName: 'partitions',
  },
  {
    description:
      'Print the generated output to the terminal instead of a file.',
    longName: 'print',
  },
  {
    description:
      'Generate runtime enums instead of string unions for PostgreSQL enums.',
    longName: 'runtime-enums',
  },
  {
    default: DEFAULT_RUNTIME_ENUMS_STYLE,
    description:
      'Which naming convention to use for runtime enum keys. Only works with `--runtime-enums`.',
    longName: 'runtime-enums-style',
    values: ['pascal-case', 'screaming-snake-case'],
  },
  {
    description: 'Set the default schema(s) for the database connection.',
    longName: 'schema',
  },
  {
    description:
      'Singularize generated table names, e.g. `BlogPost` instead of `BlogPosts`.',
    longName: 'singular',
  },
  {
    default: 'true',
    description:
      'Generate code using the TypeScript 3.8+ `import type` syntax.',
    longName: 'type-only-imports',
  },
  {
    default: DEFAULT_URL,
    description:
      'Set the database connection string URL. This may point to an environment variable.',
    longName: 'url',
  },
  {
    description: 'Verify that the generated types are up-to-date.',
    longName: 'verify',
  },
];

export const serializeFlags = (flags: Flag[]) => {
  const lines: { fullDescription: string; line: string }[] = [];
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

import { DEFAULT_OUT_FILE, DEFAULT_URL, VALID_DIALECTS } from './constants';

type Flag = {
  default?: string;
  description: string;
  example?: string;
  examples?: string[];
  longName: string;
  shortName?: string;
  values?: string[];
};

export const FLAGS = [
  {
    description: 'Use the Kysely CamelCasePlugin.',
    longName: 'camel-case',
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
    values: ['debug', 'info', 'warn', 'error', 'silent'],
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
      'Specify type overrides for specific table columns in JSON format.',
    example: '{"columns":{"table_name.column_name":"{ foo: \\"bar\\" }"}}',
    longName: 'overrides',
  },
  {
    description: 'Include partitions of PostgreSQL tables.',
    longName: 'partitions',
  },
  {
    description: 'Print the generated output to the terminal.',
    longName: 'print',
  },
  {
    description: 'Generate runtime enums instead of string unions.',
    longName: 'runtime-enums',
  },
  {
    description: 'Set the default schema for the database connection.',
    longName: 'schema',
  },
  {
    description: 'Singularize entities.',
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

const serializeFlags = (flags: Flag[]) => {
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

export const flagsString = serializeFlags(FLAGS);

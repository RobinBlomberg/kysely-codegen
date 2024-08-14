import { DEFAULT_OUT_FILE, DEFAULT_URL, VALID_DIALECTS } from './constants';

export type Flag = {
  description: string;
  longName: string;
  shortName?: string;
};

export const FLAGS: Flag[] = [
  {
    description: 'Use the Kysely CamelCasePlugin.',
    longName: 'camel-case',
  },
  {
    description: `Set the SQL dialect. (values: [${VALID_DIALECTS.join(', ')}])`,
    longName: 'dialect',
  },
  {
    description: 'Specify the path to an environment file to use.',
    longName: 'env-file',
  },
  {
    description:
      'Exclude tables matching the specified glob pattern. ' +
      '(examples: users, *.table, secrets.*, *._*)',
    longName: 'exclude-pattern',
  },
  {
    description: 'Print this message.',
    longName: 'help',
    shortName: 'h',
  },
  {
    description:
      'Only include tables matching the specified glob pattern. ' +
      '(examples: users, *.table, secrets.*, *._*)',
    longName: 'include-pattern',
  },
  {
    description:
      'Set the terminal log level. (values: [debug, info, warn, error, silent], default: warn)',
    longName: 'log-level',
  },
  {
    description: 'Skip generating types for PostgreSQL domains.',
    longName: 'no-domains',
  },
  {
    description:
      'Specify which parser to use for PostgreSQL numeric values. (values: [string, number, number-or-string], default: string)',
    longName: 'numeric-parser',
  },
  {
    description: `Set the file build path. (default: ${DEFAULT_OUT_FILE})`,
    longName: 'out-file',
  },
  {
    description:
      'Specify type overrides for specific table columns in JSON format. ' +
      '(example: {"columns":{"table_name.column_name":"{ foo: \\"bar\\" }"}})',
    longName: 'overrides',
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
    description: 'Singularize entities.',
    longName: 'singular',
  },
  {
    description:
      'Generate code using the TypeScript 3.8+ `import type` syntax. (default: true)',
    longName: 'type-only-imports',
  },
  {
    description:
      'Set the database connection string URL. ' +
      `This may point to an environment variable. (default: ${DEFAULT_URL})`,
    longName: 'url',
  },
  {
    description: 'Set the default schema of the database connection.',
    longName: 'schema',
  },
  {
    description: 'Verify that the generated types are up-to-date.',
    longName: 'verify',
  },
];

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
    description: `Set the SQL dialect. (values: [${VALID_DIALECTS.join(
      ', ',
    )}])`,
    longName: 'dialect',
  },
  {
    description: 'Print this message.',
    longName: 'help',
    shortName: 'h',
  },
  {
    description:
      'Exclude tables matching the specified glob pattern. ' +
      '(examples: users, *.table, secrets.*, *._*)',
    longName: 'exclude-pattern',
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
    description: `Set the file build path. (default: ${DEFAULT_OUT_FILE})`,
    longName: 'out-file',
  },
  {
    description: 'Print the generated output to the terminal.',
    longName: 'print',
  },
  {
    description:
      'Generate TypeScript 3.8+ `import type` syntax (default: true).',
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
];

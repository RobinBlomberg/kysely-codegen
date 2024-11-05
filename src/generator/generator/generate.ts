import { promises as fs } from 'fs';
import type { Kysely } from 'kysely';
import { parse, relative, resolve, sep } from 'path';
import { performance } from 'perf_hooks';
import type { DatabaseMetadata } from '../../introspector';
import type { GeneratorDialect } from '../dialect';
import type { Logger } from '../logger/logger';
import { transform, type Overrides } from '../transformer/transform';
import { DiffChecker } from './diff-checker';
import type { RuntimeEnumsStyle } from './runtime-enums-style';
import { Serializer } from './serializer';

export type SerializeFromMetadataOptions = Omit<
  GenerateOptions,
  | 'db'
  | 'excludePattern'
  | 'includePattern'
  | 'outFile'
  | 'partitions'
  | 'print'
  | 'verify'
> & {
  metadata: DatabaseMetadata;
  startTime?: number;
};

export type GenerateOptions = {
  camelCase?: boolean;
  db: Kysely<any>;
  defaultSchemas?: string[];
  dialect: GeneratorDialect;
  excludePattern?: string;
  includePattern?: string;
  logger?: Logger;
  outFile?: string | null;
  overrides?: Overrides;
  partitions?: boolean;
  print?: boolean;
  runtimeEnums?: boolean | RuntimeEnumsStyle;
  serializer?: Serializer;
  singularize?: boolean | Record<string, string>;
  typeOnlyImports?: boolean;
  verify?: boolean;
};

/**
 * Generates codegen output using specified options.
 */
export const generate = async (options: GenerateOptions) => {
  const startTime = performance.now();

  options.logger?.info('Introspecting database...');

  const metadata = await options.dialect.introspector.introspect({
    db: options.db,
    excludePattern: options.excludePattern,
    includePattern: options.includePattern,
    partitions: options.partitions,
  });

  const newOutput = serializeFromMetadata({ ...options, metadata, startTime });

  const outFile = options.outFile
    ? resolve(process.cwd(), options.outFile)
    : null;

  if (options.print) {
    console.info();
    console.info(newOutput);
  } else if (outFile) {
    if (options.verify) {
      const oldOutput = await fs.readFile(outFile, 'utf8');
      const diffChecker = new DiffChecker();
      const diff = diffChecker.diff(newOutput, oldOutput);

      if (diff) {
        options.logger?.error(diff);
        throw new Error(
          "Generated types are not up-to-date! Use '--log-level=error' option to view the diff.",
        );
      }

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      options.logger?.success(
        `Generated types are up-to-date! (${duration}ms)`,
      );
    } else {
      const outDir = parse(outFile).dir;

      await fs.mkdir(outDir, { recursive: true });
      await fs.writeFile(outFile, newOutput);

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      const tableCount = metadata.tables.length;
      const s = tableCount === 1 ? '' : 's';
      const relativePath = `.${sep}${relative(process.cwd(), outFile)}`;

      options.logger?.success(
        `Introspected ${tableCount} table${s} and generated ${relativePath} in ${duration}ms.\n`,
      );
    }
  } else {
    options.logger?.success('No output file specified. Skipping file write.');
  }

  return newOutput;
};

export const serializeFromMetadata = (
  options: SerializeFromMetadataOptions,
) => {
  options.logger?.debug();

  const s = options.metadata.tables.length === 1 ? '' : 's';
  options.logger?.debug(
    `Found ${options.metadata.tables.length} public table${s}:`,
  );

  for (const table of options.metadata.tables) {
    options.logger?.debug(` - ${table.name}`);
  }

  options.logger?.debug();

  const nodes = transform({
    camelCase: options.camelCase,
    defaultSchemas: options.defaultSchemas,
    dialect: options.dialect,
    metadata: options.metadata,
    overrides: options.overrides,
    runtimeEnums: options.runtimeEnums,
  });

  const serializer =
    options.serializer ??
    new Serializer({
      camelCase: options.camelCase,
      runtimeEnums: options.runtimeEnums,
      singularize: options.singularize,
      typeOnlyImports: options.typeOnlyImports,
    });

  return serializer.serializeFile(nodes);
};

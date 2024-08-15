import { promises as fs } from 'fs';
import type { Kysely } from 'kysely';
import { parse, relative, sep } from 'path';
import { performance } from 'perf_hooks';
import type { NumericParser } from '../../dialects';
import type { Dialect } from '../../introspector';
import { DiffChecker } from '../core/diff-checker';
import type { Logger } from '../core/logger';
import { Serializer } from '../serializer/serializer';
import type { Overrides } from '../transformer/transformer';
import { Transformer } from '../transformer/transformer';

export type GenerateOptions = {
  camelCase?: boolean;
  db: Kysely<any>;
  dialect: Dialect;
  excludePattern?: string;
  includePattern?: string;
  logger?: Logger;
  numericParser?: NumericParser;
  outFile?: string;
  overrides?: Overrides;
  partitions?: boolean;
  print?: boolean;
  runtimeEnums?: boolean;
  schema?: string;
  serializer?: Serializer;
  singular?: boolean;
  transformer?: Transformer;
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
    partitions: !!options.partitions,
  });

  options.logger?.debug();
  options.logger?.debug(`Found ${metadata.tables.length} public tables:`);

  for (const table of metadata.tables) {
    options.logger?.debug(` - ${table.name}`);
  }

  options.logger?.debug();

  const transformer = options.transformer ?? new Transformer();
  const nodes = transformer.transform({
    camelCase: !!options.camelCase,
    defaultSchema: options.schema,
    dialect: options.dialect,
    metadata,
    overrides: options.overrides,
    runtimeEnums: !!options.runtimeEnums,
  });

  const serializer =
    options.serializer ??
    new Serializer({
      camelCase: !!options.camelCase,
      singular: !!options.singular,
      typeOnlyImports: options.typeOnlyImports,
    });
  const data = serializer.serializeFile(nodes);

  const relativeOutDir = options.outFile
    ? `.${sep}${relative(process.cwd(), options.outFile)}`
    : null;

  if (options.print) {
    console.log();
    console.log(data);
  } else if (relativeOutDir) {
    if (options.verify) {
      let existingTypes: string;

      try {
        existingTypes = await fs.readFile(relativeOutDir, 'utf8');
      } catch (error: unknown) {
        options.logger?.error(error);
        throw new Error('Failed to load existing types');
      }

      const diffChecker = new DiffChecker();
      const diff = diffChecker.diff(data, existingTypes);

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
      const outDir = parse(relativeOutDir).dir;

      await fs.mkdir(outDir, { recursive: true });
      await fs.writeFile(relativeOutDir, data);

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      const tableCount = metadata.tables.length;
      const s = tableCount === 1 ? '' : 's';

      options.logger?.success(
        `Introspected ${tableCount} table${s} and generated ${relativeOutDir} in ${duration}ms.\n`,
      );
    }
  }

  return data;
};

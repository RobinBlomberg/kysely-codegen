import { mkdir, readFile, writeFile } from 'fs/promises';
import { parse, relative, sep } from 'path';
import { performance } from 'perf_hooks';
import type { DialectName } from '../../introspector/index.js';
import { introspectDatabase } from '../../introspector/index.js';
import { getGeneratorAdapter } from '../core/adapters.js';
import { diffOutputs } from '../core/diff-outputs.js';
import type { Logger } from '../core/logger.js';
import { Serializer } from '../serializer/serializer.js';
import { transform } from '../transformer/transform.js';

export type GenerateOptions = {
  camelCase?: boolean;
  connectionString: string;
  dialectName: DialectName;
  excludePattern?: string;
  includePattern?: string;
  logger?: Logger;
  outFile?: string;
  print?: boolean;
  runtimeEnums?: boolean;
  schema?: string;
  serializer?: Serializer;
  typeOnlyImports?: boolean;
  verify?: boolean;
};

/**
 * Generates codegen output using specified options.
 */
export const generate = async (options: GenerateOptions) => {
  const startTime = performance.now();

  options.logger?.info('Introspecting database...');

  const schema = await introspectDatabase({
    db: options.connectionString,
    dialect: options.dialectName,
    excludePattern: options.excludePattern,
    includePattern: options.includePattern,
  });

  options.logger?.debug();
  options.logger?.debug(`Found ${schema.tables.length} public tables:`);

  for (const table of schema.tables) {
    options.logger?.debug(` - ${table.name}`);
  }

  options.logger?.debug();

  const adapter = getGeneratorAdapter(options.dialectName);
  const nodes = transform({
    adapter,
    camelCase: !!options.camelCase,
    defaultSchema: options.schema,
    schema,
  });

  const serializer =
    options.serializer ??
    new Serializer({
      camelCase: !!options.camelCase,
      typeOnlyImports: options.typeOnlyImports,
    });
  const data = serializer.serialize(nodes);

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
        existingTypes = await readFile(relativeOutDir, 'utf8');
      } catch (error: unknown) {
        options.logger?.error(error);
        throw new Error('Failed to load existing types');
      }

      const diff = diffOutputs(data, existingTypes);

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

      await mkdir(outDir, { recursive: true });
      await writeFile(relativeOutDir, data);

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      const tableCount = schema.tables.length;
      const s = tableCount === 1 ? '' : 's';

      options.logger?.success(
        `Introspected ${tableCount} table${s} and generated ${relativeOutDir} in ${duration}ms.\n`,
      );
    }
  }

  return data;
};

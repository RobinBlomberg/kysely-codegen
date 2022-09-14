import { promises as fs } from 'fs';
import { parse, relative, sep } from 'path';
import { performance } from 'perf_hooks';
import { Dialect } from './dialect';
import { Logger } from './logger';
import { Serializer } from './serializer';
import { Transformer } from './transformer';

export type GeneratorOptions = {
  camelCase: boolean;
  connectionString: string;
  dialect: Dialect;
  logger?: Logger;
  serializer?: Serializer;
  transformer?: Transformer;
};

export type GenerateOptions = {
  excludePattern?: string;
  includePattern?: string;
  outFile: string;
  print?: boolean;
};

/**
 * Generates codegen output using specified options.
 */
export class Generator {
  readonly camelCase: boolean;
  readonly connectionString: string;
  readonly dialect: Dialect;
  readonly logger: Logger | undefined;
  readonly serializer: Serializer | undefined;
  readonly transformer: Transformer | undefined;

  constructor(options: GeneratorOptions) {
    this.camelCase = options.camelCase;
    this.connectionString = options.connectionString;
    this.dialect = options.dialect;
    this.logger = options.logger;
    this.transformer = options.transformer;
  }

  async generate(options: GenerateOptions) {
    const startTime = performance.now();

    this.logger?.info('Introspecting database...');

    const metadata = await this.dialect.introspector.introspect({
      connectionString: this.connectionString,
      dialect: this.dialect,
      excludePattern: options.excludePattern,
      includePattern: options.includePattern,
    });

    this.logger?.debug();
    this.logger?.debug(`Found ${metadata.tables.length} public tables:`);

    for (const table of metadata.tables) {
      this.logger?.debug(` - ${table.name}`);
    }

    this.logger?.debug();

    const transformer =
      this.transformer ??
      new Transformer(this.dialect, this.camelCase, metadata.enums);
    const nodes = transformer.transform(metadata);

    const serializer = this.serializer ?? new Serializer();
    const data = serializer.serialize(nodes);

    if (options.print) {
      this.logger?.log();
      this.logger?.log(data);
    } else {
      const outDir = parse(options.outFile).dir;

      await fs.mkdir(outDir, { recursive: true });
      await fs.writeFile(options.outFile, data);

      const endTime = performance.now();
      const relativeOutDir = `.${sep}${relative(
        process.cwd(),
        options.outFile,
      )}`;
      const duration = Math.round(endTime - startTime);

      this.logger?.success(
        `Introspected ${metadata.tables.length} table${
          metadata.tables.length === 1 ? '' : 's'
        } and generated ${relativeOutDir} in ${duration}ms.\n`,
      );
    }
  }
}

import { promises as fs } from 'fs';
import { parse, relative, sep } from 'path';
import { performance } from 'perf_hooks';
import { Dialect } from './dialect';
import { Introspector } from './introspector';
import { Logger } from './logger';
import { Serializer } from './serializer';
import { Transformer } from './transformer';

export type GeneratorOptions = {
  camelCase: boolean;
  connectionString: string;
  dialect: Dialect;
  introspector?: Introspector;
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
  readonly connectionString: string;
  readonly dialect: Dialect;
  readonly introspector: Introspector;
  readonly logger: Logger | undefined;
  readonly serializer: Serializer;
  readonly transformer: Transformer;

  constructor(options: GeneratorOptions) {
    this.connectionString = options.connectionString;
    this.dialect = options.dialect;
    this.introspector = options.introspector ?? new Introspector();
    this.logger = options.logger;
    this.serializer = options.serializer ?? new Serializer();
    this.transformer =
      options.transformer ??
      new Transformer(options.dialect, options.camelCase);
  }

  async generate(options: GenerateOptions) {
    const startTime = performance.now();

    this.logger?.info('Introspecting database...');

    const tables = await this.introspector.introspect({
      connectionString: this.connectionString,
      dialect: this.dialect,
      excludePattern: options.excludePattern,
      includePattern: options.includePattern,
    });

    this.logger?.debug();
    this.logger?.debug(`Found ${tables.length} public tables:`);

    for (const table of tables) {
      this.logger?.debug(` - ${table.name}`);
    }

    this.logger?.debug();

    const nodes = this.transformer.transform(tables);
    const data = this.serializer.serialize(nodes);

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
        `Introspected ${tables.length} table${
          tables.length === 1 ? '' : 's'
        } and generated ${relativeOutDir} in ${duration}ms.\n`,
      );
    }
  }
}

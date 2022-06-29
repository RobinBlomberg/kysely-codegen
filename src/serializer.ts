import { ColumnMetadata, TableMetadata } from 'kysely';
import { CodegenDialect } from './dialect';
import { CodegenFormat } from './enums/format';

export type TableMetadataWithModelName = TableMetadata & {
  modelName: string;
};

export class CodegenSerializer {
  readonly dialect: CodegenDialect;
  readonly format: CodegenFormat;
  readonly tables: TableMetadataWithModelName[];

  constructor(options: {
    dialect: CodegenDialect;
    format: CodegenFormat;
    tables: TableMetadata[];
  }) {
    const modelNames = this.#generateModelNames(options.tables);

    this.dialect = options.dialect;
    this.format = options.format;
    this.tables = options.tables.map(
      (metadata): TableMetadataWithModelName => ({
        ...metadata,
        modelName: modelNames[metadata.name]!,
      }),
    );
  }

  #generateModelNames(tables: TableMetadata[]) {
    const modelNames = new Set<string>();
    const tableModelNameMap: Record<string, string> = {};

    for (const table of tables) {
      let modelName = table.name
        .split('_')
        .map((word) => {
          return word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join('');

      if (modelNames.has(modelName)) {
        let suffix = 2;

        while (modelNames.has(`${modelName}${suffix}`)) {
          suffix++;
        }

        modelName += suffix;
      }

      modelNames.add(modelName);
      tableModelNameMap[table.name] = modelName;
    }

    return tableModelNameMap;
  }

  #serializeExport(name: string) {
    let data = '';

    data += 'export ';
    data += this.format;
    data += ' ';
    data += name;

    if (this.format === 'type') {
      data += ' =';
    }

    return data;
  }

  #serializeExports(exports: [string, string][]) {
    let data = '';

    data += this.#serializeExport('DB');
    data += ' {';

    if (exports.length) {
      data += '\n';

      for (const [tableName, modelName] of exports) {
        data += '  ';
        data += tableName;
        data += ': ';
        data += modelName;
        data += ';\n';
      }
    }

    data += '}\n';

    return data;
  }

  #serializeModel(modelName: string, columns: ColumnMetadata[]) {
    let data = '';

    data += this.#serializeExport(modelName);
    data += ' {';

    const sortedColumns = [...columns].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    for (const column of sortedColumns) {
      const dataType = column.dataType;
      const type =
        this.dialect.types?.[dataType] ?? this.dialect.defaultType ?? 'unknown';

      data += '\n  ';
      data += column.name;
      data += ': ';
      data += type;

      if (column.isNullable) {
        data += ' | null';
      }

      data += ';';
    }

    if (columns.length) {
      data += '\n';
    }

    data += '}\n\n';

    return data;
  }

  /**
   * @example
   * ```typescript
   * new Serializer({
   *   dialect: pgDialect,
   *   style: 'interface',
   *   tables: {
   *     name: 'user',
   *     schema: 'public',
   *     columns: [
   *       { name: 'created_at', dataType: 'timestamptz', isNullable: false },
   *       { name: 'full_name', dataType: 'varchar', isNullable: true },
   *     ],
   *   },
   * }).serialize();
   *
   * // Output:
   * export interface User {
   *   created_at: Date;
   *   full_name: string | null;
   * }
   *
   * export interface DB {
   *   user: User;
   * }
   * ```
   */
  serialize() {
    const importedTypes = new Set<string>();
    const imports: Record<string, string[]> = {};
    const definitions: [string, Record<string, string>][] = [];
    const models = [];
    const exports: [string, string][] = [];

    for (const metadata of this.tables) {
      for (const { dataType } of metadata.columns) {
        const type = this.dialect.types?.[dataType] ?? 'unknown';
        const moduleName = this.dialect.imports?.[type];

        if (moduleName && !importedTypes.has(type)) {
          if (!imports[moduleName]) {
            imports[moduleName] = [];
          }

          imports[moduleName]!.push(type);
          importedTypes.add(type);
        } else {
          const model = this.dialect.definitions?.[type];

          if (model) {
            definitions.push([type, model]);
          }
        }
      }

      models.push({
        body: this.#serializeModel(metadata.modelName, metadata.columns),
        name: metadata.modelName,
      });

      exports.push([metadata.name, metadata.modelName]);
    }

    let data = '';

    const importEntries = Object.entries(imports).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    for (const [moduleName, moduleImports] of importEntries) {
      data += 'import {';

      for (let i = 0; i < moduleImports.length; i++) {
        if (i) {
          data += ',';
        }

        data += ' ';
        data += moduleImports[i];
      }

      if (moduleImports.length) {
        data += ' ';
      }

      data += "} from '";
      data += moduleName;
      data += "';\n";
    }

    if (importEntries.length) {
      data += '\n';
    }

    for (const [name, model] of definitions) {
      const entries = Object.entries(model).sort(([a], [b]) =>
        a.localeCompare(b),
      );

      data += this.#serializeExport(name);
      data += ' {';

      for (const [key, value] of entries) {
        data += '\n  ';
        data += key;
        data += ': ';
        data += value;
        data += ';';
      }

      if (entries.length) {
        data += '\n';
      }

      data += '}\n\n';
    }

    models.sort((a, b) => a.name.localeCompare(b.name));

    for (const { body } of models) {
      data += body;
    }

    data += this.#serializeExports(exports);

    return data;
  }
}

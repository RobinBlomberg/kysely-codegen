import { ColumnMetadata, TableMetadata } from 'kysely';
import { CodegenDialect } from './dialect';
import { CodegenFormat } from './enums/format';

export type Definition = [string, Record<string, string>];

export type ImportMap = Record<string, string[]>;

export type Model = {
  body: string;
  name: string;
};

export type TableMetadataWithModelName = TableMetadata & {
  modelName: string;
};

export class CodegenSerializer {
  readonly dialect: CodegenDialect;
  readonly format: CodegenFormat;
  readonly tables: TableMetadata[];

  constructor(options: {
    dialect: CodegenDialect;
    format: CodegenFormat;
    tables: TableMetadata[];
  }) {
    this.dialect = options.dialect;
    this.format = options.format;
    this.tables = options.tables;
  }

  #analyzeTables() {
    const definitions: Definition[] = [];
    const exports: [string, string][] = [];
    const importedTypes = new Set<string>();
    const imports: Record<string, string[]> = {};
    const modelNames = new Set<string>();
    const models: Model[] = [];
    const tableModelNameMap: Record<string, string> = {};
    let hasGeneratedColumns = false;

    for (const table of this.tables) {
      if (!hasGeneratedColumns) {
        for (const column of table.columns) {
          if (column.hasDefaultValue || column.isAutoIncrementing) {
            hasGeneratedColumns = true;
          }
        }
      }

      let modelName = this.dialect.getModelName(table);

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

    if (hasGeneratedColumns) {
      imports.kysely ??= [];
      imports.kysely!.push('Generated');
    }

    const tables = this.tables.map(
      (metadata): TableMetadataWithModelName => ({
        ...metadata,
        modelName: tableModelNameMap[metadata.name]!,
      }),
    );

    for (const metadata of tables) {
      for (const { dataType } of metadata.columns) {
        const typeName = this.dialect.types?.[dataType] as string;
        const moduleName = this.dialect.imports?.[typeName];

        if (moduleName && !importedTypes.has(typeName)) {
          imports[moduleName] ??= [];
          imports[moduleName]!.push(typeName);
          importedTypes.add(typeName);
        } else {
          const model = this.dialect.definitions?.[typeName];

          if (model) {
            definitions.push([typeName, model]);
          }
        }
      }

      models.push({
        body: this.#serializeModel(metadata.modelName, metadata.columns),
        name: metadata.modelName,
      });

      exports.push([
        this.dialect.getExportedTableName(metadata),
        metadata.modelName,
      ]);
    }

    return {
      definitions,
      exports,
      imports,
      models,
    };
  }

  #serializeDefinition(name: string, model: Record<string, string>) {
    const entries = Object.entries(model).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    let data = '';

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

    return data;
  }

  #serializeDefinitions(definitions: Definition[]) {
    let data = '';

    for (const [name, model] of definitions) {
      data += this.#serializeDefinition(name, model);
    }

    return data;
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

  #serializeImport(name: string, imports: string[]) {
    let data = '';

    data += 'import {';

    for (let i = 0; i < imports.length; i++) {
      if (i) {
        data += ',';
      }

      data += ' ';
      data += imports[i];
    }

    if (imports.length) {
      data += ' ';
    }

    data += "} from '";
    data += name;
    data += "';\n";

    return data;
  }

  #serializeImports(importMap: ImportMap) {
    const importEntries = Object.entries(importMap).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    let data = '';

    for (const [name, imports] of importEntries) {
      data += this.#serializeImport(name, imports);
    }

    if (importEntries.length) {
      data += '\n';
    }

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
      const isGenerated = column.isAutoIncrementing || column.hasDefaultValue;
      const type =
        this.dialect.types?.[dataType] ?? this.dialect.defaultType ?? 'unknown';

      data += '\n  ';
      data += column.name;
      data += ': ';

      if (isGenerated) {
        data += 'Generated<';
      }

      data += type;

      if (column.isNullable) {
        data += ' | null';
      }

      if (isGenerated) {
        data += '>';
      }

      data += ';';
    }

    if (columns.length) {
      data += '\n';
    }

    data += '}\n\n';

    return data;
  }

  #serializeModels(models: Model[]) {
    let data = '';

    models.sort((a, b) => a.name.localeCompare(b.name));

    for (const { body } of models) {
      data += body;
    }

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
   *       {
   *         name: 'id',
   *         dataType: 'smallint',
   *         isNullable: false,
   *         isAutoIncrementing: true,
   *         hasDefaultValue: false,
   *       },
   *       {
   *         name: 'created_at',
   *         dataType: 'timestamptz',
   *         isNullable: false,
   *         isAutoIncrementing: false,
   *         hasDefaultValue: true,
   *       },
   *       {
   *         name: 'full_name',
   *         dataType: 'varchar',
   *         isNullable: true,
   *         isAutoIncrementing: false,
   *         hasDefaultValue: false,
   *       },
   *     ],
   *   },
   * }).serialize();
   *
   * // Output:
   * export interface User {
   *   created_at: Generated<number | string | Date>;
   *   full_name: string | null;
   *   id: Generated<number>;
   * }
   *
   * export interface DB {
   *   user: User;
   * }
   * ```
   */
  serialize() {
    const { definitions, exports, imports, models } = this.#analyzeTables();
    let data = '';

    data += this.#serializeImports(imports);
    data += this.#serializeDefinitions(definitions);
    data += this.#serializeModels(models);
    data += this.#serializeExports(exports);

    return data;
  }
}

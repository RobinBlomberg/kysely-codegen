import { ColumnMetadata, TableMetadata } from 'kysely';
import { CodegenDialect } from './dialect';
import { CodegenFormat } from './enums/format';

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

      for (const [tableName, interfaceName] of exports) {
        data += '  ';
        data += tableName;
        data += ': ';
        data += interfaceName;
        data += ';\n';
      }
    }

    data += '}\n';

    return data;
  }

  #serializeInterface(interfaceName: string, columns: ColumnMetadata[]) {
    let data = '';

    data += this.#serializeExport(interfaceName);
    data += ' {';

    const sortedColumns = [...columns].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    for (const column of sortedColumns) {
      const dataType = column.dataType as keyof typeof this.dialect.types;
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

  #serializeInterfaceName(tableName: string) {
    return tableName
      .split('_')
      .map(
        (word) => word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join('');
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
    const models: [string, Record<string, string>][] = [];
    const interfaces = [];
    const exports: [string, string][] = [];

    for (const table of this.tables) {
      for (const { dataType } of table.columns) {
        const type = this.dialect.types?.[
          dataType
        ] as keyof typeof this.dialect.imports;
        const moduleName = this.dialect.imports?.[type];

        if (moduleName && !importedTypes.has(type)) {
          if (!imports[moduleName]) {
            imports[moduleName] = [];
          }

          imports[moduleName]!.push(type);
          importedTypes.add(type);
        } else {
          const model = this.dialect.models?.[type];

          if (model) {
            models.push([type, model]);
          }
        }
      }

      const interfaceName = this.#serializeInterfaceName(table.name);

      interfaces.push({
        body: this.#serializeInterface(interfaceName, table.columns),
        name: interfaceName,
      });

      exports.push([table.name, interfaceName]);
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

    for (const [name, model] of models) {
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

    interfaces.sort((a, b) => a.name.localeCompare(b.name));

    for (const { body } of interfaces) {
      data += body;
    }

    data += this.#serializeExports(exports);

    return data;
  }
}

import { ColumnMetadata, TableMetadata } from 'kysely';
import { DIALECT_BY_DRIVER, Driver } from './dialects';
import { Dialect, Style } from './types';

const serializeExport = (style: Style, name: string) => {
  let data = '';

  data += 'export ';
  data += style;
  data += ' ';
  data += name;

  if (style === 'type') {
    data += ' =';
  }

  return data;
};

const serializeExports = (options: {
  exports: [string, string][];
  style: Style;
}) => {
  const { exports, style } = options;
  let data = '';

  data += serializeExport(style, 'DB');
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
};

const serializeInterface = (options: {
  columns: ColumnMetadata[];
  dialect: Dialect;
  interfaceName: string;
  style: Style;
}) => {
  const { columns, dialect, interfaceName, style } = options;
  let data = '';

  data += serializeExport(style, interfaceName);
  data += ' {';

  const sortedColumns = [...columns].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  for (const column of sortedColumns) {
    /**
     * NOTE: Kysely typing does not match the pg driver types, so we'll need to type cast.
     */
    const dataType = column.dataType as keyof typeof dialect.types;
    const type = dialect.types[dataType] ?? dialect.defaultType;

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
};

const serializeInterfaceName = (tableName: string) => {
  return tableName
    .split('_')
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

export type { Style };

/**
 * @example
 * ```typescript
 * serialize({
 *   driver: 'pg',
 *   style: 'interface',
 *   tables: {
 *     name: 'user',
 *     schema: 'public',
 *     columns: [
 *       { name: 'created_at', dataType: 'timestamptz', isNullable: false },
 *       { name: 'full_name', dataType: 'varchar', isNullable: true },
 *     ],
 *   },
 * });
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
export const serialize = (options: {
  driver: Driver;
  style: Style;
  tables: TableMetadata[];
}) => {
  const { driver, style, tables } = options;
  const dialect = DIALECT_BY_DRIVER[driver];
  const importedTypes = new Set<string>();
  const imports: Record<string, string[]> = {};
  const models: [string, Record<string, string>][] = [];
  const interfaces = [];
  const exports: [string, string][] = [];

  for (const table of tables) {
    for (const { dataType } of table.columns) {
      const type = dialect.types[dataType] as keyof typeof dialect.imports;
      const moduleName = dialect.imports[type];

      if (moduleName && !importedTypes.has(type)) {
        if (!imports[moduleName]) {
          imports[moduleName] = [];
        }

        imports[moduleName]!.push(type);
        importedTypes.add(type);
      } else {
        const model = dialect.models[type];

        if (model) {
          models.push([type, model]);
        }
      }
    }

    const interfaceName = serializeInterfaceName(table.name);

    interfaces.push({
      body: serializeInterface({
        columns: table.columns,
        dialect,
        interfaceName,
        style,
      }),
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

    data += serializeExport(style, name);
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

  data += serializeExports({ exports, style });

  return data;
};

import type { EnumCollection } from '../../introspector/enum-collection';
import type { ColumnMetadata } from '../../introspector/metadata/column-metadata';
import type { DatabaseMetadata } from '../../introspector/metadata/database-metadata';
import type { TableMetadata } from '../../introspector/metadata/table-metadata';
import type { Definitions, Imports, Scalars } from '../adapter';
import { AliasDeclarationNode } from '../ast/alias-declaration-node';
import { ArrayExpressionNode } from '../ast/array-expression-node';
import { ExportStatementNode } from '../ast/export-statement-node';
import type { ExpressionNode } from '../ast/expression-node';
import { GenericExpressionNode } from '../ast/generic-expression-node';
import { IdentifierNode, TableIdentifierNode } from '../ast/identifier-node';
import { ImportClauseNode } from '../ast/import-clause-node';
import { ImportStatementNode } from '../ast/import-statement-node';
import { InterfaceDeclarationNode } from '../ast/interface-declaration-node';
import { LiteralNode } from '../ast/literal-node';
import { ModuleReferenceNode } from '../ast/module-reference-node';
import { ObjectExpressionNode } from '../ast/object-expression-node';
import { PropertyNode } from '../ast/property-node';
import { RawExpressionNode } from '../ast/raw-expression-node';
import { RuntimeEnumDeclarationNode } from '../ast/runtime-enum-declaration-node';
import type { TemplateNode } from '../ast/template-node';
import { UnionExpressionNode } from '../ast/union-expression-node';
import type { GeneratorDialect } from '../dialect';
import { PostgresDialect } from '../dialects/postgres/postgres-dialect';
import type { RuntimeEnumsStyle } from '../generator/runtime-enums-style';
import { toKyselyCamelCase } from '../utils/case-converter';
import { GLOBAL_DEFINITIONS } from './definitions';
import { GLOBAL_IMPORTS } from './imports';
import type { SymbolNode } from './symbol-collection';
import { SymbolCollection } from './symbol-collection';

export type Overrides = {
  /**
   * Specifies type overrides for columns.
   *
   * @example
   * ```ts
   * // Allows overriding of columns to be a type-safe JSON column:
   * {
   *   columns: {
   *     "<table_name>.<column_name>": new JsonColumnType(
   *       new RawExpressionNode("{ postalCode: string; street: string; city: string }")
   *     ),
   *   }
   * }
   * ```
   */
  columns?: Record<string, ExpressionNode | string>;
};

type TransformContext = {
  camelCase: boolean;
  customImports: Record<string, string> | undefined;
  defaultScalar: ExpressionNode;
  defaultSchemas: string[];
  definitions: Definitions;
  dialect: GeneratorDialect;
  enums: EnumCollection;
  imports: Imports;
  metadata: DatabaseMetadata;
  overrides: Overrides | undefined;
  runtimeEnums: boolean | RuntimeEnumsStyle;
  scalars: Scalars;
  symbols: SymbolCollection;
  typeMapping: Record<string, string> | undefined;
};

export type TransformOptions = {
  camelCase?: boolean;
  customImports?: Record<string, string>;
  defaultSchemas?: string[];
  dialect: GeneratorDialect;
  metadata: DatabaseMetadata;
  overrides?: Overrides;
  runtimeEnums?: boolean | RuntimeEnumsStyle;
  typeMapping?: Record<string, string>;
};

const POSTGRES_RANGE_TYPES = new Set([
  'datemultirange',
  'daterange',
  'int4multirange',
  'int4range',
  'int8multirange',
  'int8range',
  'nummultirange',
  'numrange',
  'tsmultirange',
  'tsrange',
  'tstzmultirange',
  'tstzrange',
]);

const collectSymbol = (name: string, context: TransformContext) => {
  const definition = context.definitions[name];
  if (definition) {
    if (context.symbols.has(name)) {
      return;
    }

    context.symbols.set(name, { node: definition, type: 'Definition' });
    collectSymbols(definition, context);
    return;
  }

  const moduleReference = context.imports[name];
  if (moduleReference) {
    if (context.symbols.has(name)) {
      return;
    }

    context.symbols.set(name, {
      node: moduleReference,
      type: 'ModuleReference',
    });
  }
};

const extractIdentifiersFromTypeExpression = (expression: string) => {
  const identifiers = new Set<string>();
  let i = 0;
  let inLineComment = false;
  let inBlockComment = false;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplateLiteral = false;
  let templateExpressionDepth = 0;
  let memberStart = false;

  const isIdentifierStart = (char: string | undefined) => {
    if (!char) {
      return false;
    }

    return (
      (char >= 'A' && char <= 'Z') ||
      (char >= 'a' && char <= 'z') ||
      char === '_' ||
      char === '$'
    );
  };

  const isIdentifierPart = (char: string | undefined) => {
    if (!char) {
      return false;
    }

    return isIdentifierStart(char) || (char >= '0' && char <= '9');
  };

  const isWhitespace = (char: string | undefined) =>
    char === ' ' || char === '\n' || char === '\r' || char === '\t';

  const skipLineComment = (startIndex: number) => {
    let index = startIndex;

    while (index < expression.length && expression[index] !== '\n') {
      index += 1;
    }

    return index;
  };

  const skipBlockComment = (startIndex: number) => {
    let index = startIndex;

    while (index < expression.length) {
      if (expression[index] === '*' && expression[index + 1] === '/') {
        return index + 2;
      }

      index += 1;
    }

    return index;
  };

  const skipTrivia = (startIndex: number) => {
    let index = startIndex;

    while (index < expression.length) {
      const char = expression[index];
      const nextChar = expression[index + 1];

      if (isWhitespace(char)) {
        index += 1;
        continue;
      }

      if (char === '/' && nextChar === '/') {
        index = skipLineComment(index + 2);
        continue;
      }

      if (char === '/' && nextChar === '*') {
        index = skipBlockComment(index + 2);
        continue;
      }

      break;
    }

    return index;
  };

  const peekNextNonTriviaChar = (startIndex: number) => {
    const index = skipTrivia(startIndex);

    if (index >= expression.length) {
      return null;
    }

    return { char: expression[index]!, index };
  };

  const peekNextIdentifier = (startIndex: number) => {
    const nextChar = peekNextNonTriviaChar(startIndex);

    if (!nextChar || !isIdentifierStart(nextChar.char)) {
      return null;
    }

    let end = nextChar.index + 1;

    while (end < expression.length && isIdentifierPart(expression[end]!)) {
      end += 1;
    }

    return expression.slice(nextChar.index, end);
  };

  const isMemberModifier = (identifier: string) => identifier === 'readonly';

  const isMemberName = (identifierEndIndex: number) => {
    if (!memberStart) {
      return false;
    }

    const nextChar = peekNextNonTriviaChar(identifierEndIndex);

    if (!nextChar) {
      return false;
    }

    if (nextChar.char === '?') {
      const afterQuestion = peekNextNonTriviaChar(nextChar.index + 1);
      return afterQuestion?.char === ':';
    }

    if (nextChar.char === ':') {
      return true;
    }

    return peekNextIdentifier(identifierEndIndex) === 'in';
  };

  const skipNestedTemplateLiteral = (startIndex: number) => {
    let index = startIndex + 1;

    while (index < expression.length) {
      const char = expression[index];

      if (char === '\\') {
        index += 2;
        continue;
      }

      if (char === '`') {
        return index + 1;
      }

      index += 1;
    }

    return index;
  };

  while (i < expression.length) {
    const char = expression[i];
    const nextChar = expression[i + 1];

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false;
      }

      i += 1;
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && nextChar === '/') {
        inBlockComment = false;
        i += 2;
        continue;
      }

      i += 1;
      continue;
    }

    if (inSingleQuote) {
      if (char === '\\') {
        i += 2;
        continue;
      }

      if (char === "'") {
        inSingleQuote = false;
      }

      i += 1;
      continue;
    }

    if (inDoubleQuote) {
      if (char === '\\') {
        i += 2;
        continue;
      }

      if (char === '"') {
        inDoubleQuote = false;
      }

      i += 1;
      continue;
    }

    if (inTemplateLiteral && templateExpressionDepth === 0) {
      if (char === '\\') {
        i += 2;
        continue;
      }

      if (char === '$' && nextChar === '{') {
        templateExpressionDepth = 1;
        i += 2;
        continue;
      }

      if (char === '`') {
        inTemplateLiteral = false;
      }

      i += 1;
      continue;
    }

    if (char === '/' && nextChar === '/') {
      inLineComment = true;
      i += 2;
      continue;
    }

    if (char === '/' && nextChar === '*') {
      inBlockComment = true;
      i += 2;
      continue;
    }

    if (char === "'") {
      inSingleQuote = true;
      i += 1;
      continue;
    }

    if (char === '"') {
      inDoubleQuote = true;
      i += 1;
      continue;
    }

    if (char === '`') {
      if (templateExpressionDepth > 0) {
        i = skipNestedTemplateLiteral(i);
      } else {
        inTemplateLiteral = true;
        i += 1;
      }

      continue;
    }

    if (templateExpressionDepth > 0) {
      if (char === '{') {
        templateExpressionDepth += 1;
        memberStart = true;
        i += 1;
        continue;
      }

      if (char === '}') {
        templateExpressionDepth -= 1;
        memberStart = false;
        i += 1;
        continue;
      }
    }

    if (isIdentifierStart(char)) {
      let end = i + 1;

      while (end < expression.length && isIdentifierPart(expression[end]!)) {
        end += 1;
      }

      const identifier = expression.slice(i, end);

      if (memberStart && isMemberModifier(identifier)) {
        i = end;
        continue;
      }

      if (!isMemberName(end)) {
        identifiers.add(identifier);
      }

      memberStart = false;
      i = end;
      continue;
    }

    if (char === '{' || char === ',' || char === ';' || char === '(') {
      memberStart = true;
      i += 1;
      continue;
    }

    if (char === '[') {
      memberStart = true;
      i += 1;
      continue;
    }

    if (char === '}' || char === ')' || char === ']') {
      memberStart = false;
      i += 1;
      continue;
    }

    i += 1;
  }

  return identifiers;
};

const collectSymbolsFromRawExpression = (
  expression: string,
  context: TransformContext,
) => {
  for (const identifier of extractIdentifiersFromTypeExpression(expression)) {
    collectSymbol(identifier, context);
  }
};

const collectSymbols = (
  node: ExpressionNode | TemplateNode,
  context: TransformContext,
) => {
  switch (node.type) {
    case 'ArrayExpression':
      collectSymbols(node.values, context);
      break;
    case 'ExtendsClause':
      collectSymbols(node.extendsType, context);
      collectSymbols(node.trueType, context);
      collectSymbols(node.falseType, context);
      break;
    case 'GenericExpression': {
      collectSymbol(node.name, context);

      for (const arg of node.args) {
        collectSymbols(arg, context);
      }

      break;
    }
    case 'Identifier':
      collectSymbol(node.name, context);
      break;
    case 'InferClause':
      break;
    case 'Literal':
      break;
    case 'MappedType':
      collectSymbols(node.value, context);
      break;
    case 'ObjectExpression':
      for (const property of node.properties) {
        collectSymbols(property.value, context);
      }

      break;
    case 'RawExpression':
      collectSymbolsFromRawExpression(node.expression, context);
      break;
    case 'Template':
      collectSymbols(node.expression, context);
      break;
    case 'UnionExpression':
      for (const arg of node.args) {
        collectSymbols(arg, context);
      }

      break;
  }
};

const createContext = (options: TransformOptions): TransformContext => {
  const customImports = options.customImports || {};
  const customImportNodes: Imports = {};

  // Convert custom imports to `ModuleReferenceNode` instances:
  for (const [name, moduleSpec] of Object.entries(customImports)) {
    // Parse the `#` syntax for named imports:
    const hashIndex = moduleSpec.indexOf('#');

    if (hashIndex === -1) {
      customImportNodes[name] = new ModuleReferenceNode(moduleSpec);
    } else {
      const modulePath = moduleSpec.slice(0, hashIndex);
      const sourceName = moduleSpec.slice(hashIndex + 1);
      customImportNodes[name] = new ModuleReferenceNode(modulePath, sourceName);
    }
  }

  return {
    camelCase: !!options.camelCase,
    customImports: options.customImports,
    defaultScalar:
      options.dialect.adapter.defaultScalar ?? new IdentifierNode('unknown'),
    defaultSchemas:
      options.defaultSchemas && options.defaultSchemas.length > 0
        ? options.defaultSchemas
        : options.dialect.adapter.defaultSchemas,
    definitions: {
      ...GLOBAL_DEFINITIONS,
      ...options.dialect.adapter.definitions,
    },
    dialect: options.dialect,
    enums: options.metadata.enums,
    imports: {
      ...GLOBAL_IMPORTS,
      ...options.dialect.adapter.imports,
      ...customImportNodes,
    },
    metadata: options.metadata,
    overrides: options.overrides,
    runtimeEnums: options.runtimeEnums ?? false,
    scalars: {
      ...options.dialect.adapter.scalars,
    },
    symbols: new SymbolCollection(),
    typeMapping: options.typeMapping,
  };
};

const createDatabaseExportNode = (context: TransformContext) => {
  const tableProperties: PropertyNode[] = [];

  for (const table of context.metadata.tables) {
    const identifier = getTableIdentifier(table, context);
    const symbolName = context.symbols.getName(identifier);

    if (symbolName) {
      const value = new TableIdentifierNode(symbolName);
      const tableProperty = new PropertyNode(identifier, value);
      tableProperties.push(tableProperty);
    }
  }

  tableProperties.sort((a, b) => a.key.localeCompare(b.key));

  const body = new ObjectExpressionNode(tableProperties);
  const argument = new InterfaceDeclarationNode(new IdentifierNode('DB'), body);
  return new ExportStatementNode(argument);
};

const createRuntimeEnumDefinitionNodes = (context: TransformContext) => {
  const exportStatements: ExportStatementNode[] = [];

  for (const { symbol } of context.symbols.entries()) {
    if (symbol.type !== 'RuntimeEnumDefinition') {
      continue;
    }

    const exportStatement = new ExportStatementNode(symbol.node);
    exportStatements.push(exportStatement);
  }

  return exportStatements.sort((a, b) => {
    return a.argument.id.name.localeCompare(b.argument.id.name);
  });
};

const createDefinitionNodes = (context: TransformContext) => {
  const definitionNodes: ExportStatementNode[] = [];

  for (const { name, symbol } of context.symbols.entries()) {
    if (symbol.type !== 'Definition') {
      continue;
    }

    const argument = new AliasDeclarationNode(name, symbol.node);
    const definitionNode = new ExportStatementNode(argument);
    definitionNodes.push(definitionNode);
  }

  return definitionNodes.sort((a, b) =>
    a.argument.id.name.localeCompare(b.argument.id.name),
  );
};

const createImportNodes = (context: TransformContext) => {
  const imports: Record<string, ImportClauseNode[] | undefined> = {};
  const importNodes: ImportStatementNode[] = [];

  for (const { id, name, symbol } of context.symbols.entries()) {
    if (symbol.type !== 'ModuleReference') {
      continue;
    }

    // Handle named imports with source name:
    const importName = symbol.node.sourceName || id;
    const alias = symbol.node.sourceName
      ? importName === name
        ? null
        : // If the source name equals the desired name, no alias is needed:
          name
      : name === id
        ? null
        : name;

    (imports[symbol.node.name] ??= []).push(
      new ImportClauseNode(importName, alias),
    );
  }

  for (const [moduleName, symbolImports] of Object.entries(imports)) {
    importNodes.push(new ImportStatementNode(moduleName, symbolImports!));
  }

  return importNodes.sort((a, b) => a.moduleName.localeCompare(b.moduleName));
};

const getTableIdentifier = (
  table: TableMetadata,
  context: TransformContext,
) => {
  const name =
    table.schema &&
    context.defaultSchemas.length > 0 &&
    !context.defaultSchemas.includes(table.schema)
      ? `${table.schema}.${table.name}`
      : table.name;
  return transformName(name, context);
};

const isPostgresRangeType = (dataType: string, context: TransformContext) => {
  return (
    context.dialect.adapter.constructor.name === 'PostgresAdapter' &&
    POSTGRES_RANGE_TYPES.has(dataType)
  );
};

const transformColumn = ({
  column,
  context,
  table,
}: {
  column: ColumnMetadata;
  context: TransformContext;
  table: TableMetadata;
}) => {
  const overrides = context.overrides?.columns;
  const isDefaultSchema =
    !!table.schema && context.defaultSchemas.includes(table.schema);
  const path = `${table.name}.${column.name}`;
  const override =
    context.dialect instanceof PostgresDialect
      ? isDefaultSchema
        ? (overrides?.[`${table.schema}.${path}`] ?? overrides?.[path])
        : overrides?.[`${table.schema}.${path}`]
      : overrides?.[path];

  if (override !== undefined) {
    const node =
      typeof override === 'string' ? new RawExpressionNode(override) : override;

    collectSymbols(node, context);

    return node;
  }

  let args = transformColumnToArgs(column, context);

  if (column.isArray) {
    const unionizedArgs = unionize(args);
    const isSimpleNode =
      unionizedArgs.type === 'Identifier' &&
      ['boolean', 'number', 'string'].includes(unionizedArgs.name);
    args = isSimpleNode
      ? [new ArrayExpressionNode(unionizedArgs)]
      : [new GenericExpressionNode('ArrayType', [unionizedArgs])];
  }

  if (column.isNullable) {
    args.push(new IdentifierNode('null'));
  }

  let node = unionize(args);

  const isGenerated = column.hasDefaultValue || column.isAutoIncrementing;

  if (isGenerated) {
    node = new GenericExpressionNode('Generated', [node]);
  }

  collectSymbols(node, context);

  return node;
};

const transformColumnToArgs = (
  column: ColumnMetadata,
  context: TransformContext,
) => {
  const dataType = column.dataType.toLowerCase();

  // Check type mapping first:
  const mappedType = context.typeMapping?.[dataType];

  if (mappedType) {
    // Used as a unique identifier for the data type:
    const schema = column.dataTypeSchema ?? context.defaultSchemas[0];
    const dataTypeId = schema ? `${schema}.${dataType}` : dataType;

    // Only apply mapping if this is a known type in the dialect:
    const isKnownType =
      context.scalars[dataType] ||
      context.enums.has(dataTypeId) ||
      isPostgresRangeType(dataType, context);

    if (isKnownType) {
      // Check if the mapped type references a custom import:
      const lastDotIndex = mappedType.lastIndexOf('.');

      if (lastDotIndex !== -1) {
        // It's a namespaced type like "Temporal.Instant":
        const namespace = mappedType.slice(0, Math.max(0, lastDotIndex));
        collectSymbol(namespace, context);
      }

      return [new RawExpressionNode(mappedType)];
    }
  }

  const scalarNode = context.scalars[dataType];

  if (scalarNode) {
    return [scalarNode];
  }

  // Used as a unique identifier for the data type:
  const schema = column.dataTypeSchema ?? context.defaultSchemas[0];
  const dataTypeId = schema ? `${schema}.${dataType}` : dataType;

  // Used for serializing the name of the symbol:
  const symbolId =
    column.dataTypeSchema &&
    context.defaultSchemas.length > 0 &&
    !context.defaultSchemas.includes(column.dataTypeSchema)
      ? `${column.dataTypeSchema}.${dataType}`
      : dataType;

  const enumValues = context.enums.get(dataTypeId);

  if (enumValues) {
    if (context.runtimeEnums) {
      const symbol: SymbolNode = {
        node: new RuntimeEnumDeclarationNode(symbolId, enumValues, {
          identifierStyle:
            context.runtimeEnums === 'screaming-snake-case'
              ? 'screaming-snake-case'
              : 'kysely-pascal-case',
        }),
        type: 'RuntimeEnumDefinition',
      };
      symbol.node.id.name = context.symbols.set(symbolId, symbol);
      const node = new IdentifierNode(symbol.node.id.name);
      return [node];
    }

    const symbolName = context.symbols.set(symbolId, {
      node: unionize(transformEnum(enumValues)),
      type: 'Definition',
    });
    const node = new IdentifierNode(symbolName);
    return [node];
  }

  const symbolName = context.symbols.getName(symbolId);

  if (symbolName) {
    const node = new IdentifierNode(symbolName ?? 'unknown');
    return [node];
  }

  if (column.enumValues) {
    return transformEnum(column.enumValues);
  }

  return [context.defaultScalar];
};

const transformEnum = (enumValues: string[]) => {
  return enumValues.map((enumValue) => new LiteralNode(enumValue));
};

const transformName = (name: string, context: TransformContext) => {
  return context.camelCase ? toKyselyCamelCase(name) : name;
};

const transformTables = (context: TransformContext) => {
  const tableNodes: ExportStatementNode[] = [];

  for (const table of context.metadata.tables) {
    const tableProperties: PropertyNode[] = [];

    for (const column of table.columns) {
      const key = transformName(column.name, context);
      const value = transformColumn({ column, context, table });
      const comment = column.comment;
      const tableProperty = new PropertyNode(key, value, comment);
      tableProperties.push(tableProperty);
    }

    const expression = new ObjectExpressionNode(tableProperties);
    const identifier = getTableIdentifier(table, context);
    const symbolName = context.symbols.set(identifier, { type: 'Table' });
    const tableNode = new ExportStatementNode(
      new InterfaceDeclarationNode(
        new TableIdentifierNode(symbolName),
        expression,
      ),
    );
    tableNodes.push(tableNode);
  }

  tableNodes.sort((a, b) =>
    a.argument.id.name.localeCompare(b.argument.id.name),
  );

  return tableNodes;
};

const unionize = (args: ExpressionNode[]) => {
  switch (args.length) {
    case 0:
      return new IdentifierNode('never');
    case 1:
      return args[0]!;
    default:
      return new UnionExpressionNode(args);
  }
};

export const transform = (options: TransformOptions) => {
  const context = createContext(options);
  const tableNodes = transformTables(context);
  const importNodes = createImportNodes(context);
  const runtimeEnumDefinitionNodes = createRuntimeEnumDefinitionNodes(context);
  const definitionNodes = createDefinitionNodes(context);
  const databaseNode = createDatabaseExportNode(context);

  return [
    ...importNodes,
    ...runtimeEnumDefinitionNodes,
    ...definitionNodes,
    ...tableNodes,
    databaseNode,
  ];
};

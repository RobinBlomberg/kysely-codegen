import type {
  ColumnSchema,
  DatabaseSchema,
  EnumMap,
  TableSchema,
} from '../../introspector/index.js';
import { AliasDeclarationNode } from '../ast/alias-declaration-node.js';
import { ArrayExpressionNode } from '../ast/array-expression-node.js';
import { ExportStatementNode } from '../ast/export-statement-node.js';
import type { ExpressionNode } from '../ast/expression-node.js';
import { GenericExpressionNode } from '../ast/generic-expression-node.js';
import { IdentifierNode } from '../ast/identifier-node.js';
import { ImportClauseNode } from '../ast/import-clause-node.js';
import { ImportStatementNode } from '../ast/import-statement-node.js';
import { InterfaceDeclarationNode } from '../ast/interface-declaration-node.js';
import { LiteralNode } from '../ast/literal-node.js';
import { NodeType } from '../ast/node-type.js';
import { ObjectExpressionNode } from '../ast/object-expression-node.js';
import { PropertyNode } from '../ast/property-node.js';
import type { TemplateNode } from '../ast/template-node.js';
import { UnionExpressionNode } from '../ast/union-expression-node.js';
import type {
  Adapter,
  DefinitionMap,
  ImportMap,
  ScalarMap,
} from '../core/adapter.js';
import { toCamelCase } from './case-converter.js';
import { GLOBAL_DEFINITIONS } from './definitions.js';
import { GLOBAL_IMPORTS } from './imports.js';
import { SymbolCollection, SymbolType } from './symbol-collection.js';

export type TransformContext = {
  camelCase: boolean;
  defaultScalar: ExpressionNode;
  defaultSchema: string | null;
  definitions: DefinitionMap;
  enums: EnumMap;
  imports: ImportMap;
  schema: DatabaseSchema;
  scalars: ScalarMap;
  symbols: SymbolCollection;
};

export type TransformOptions = {
  adapter: Adapter;
  camelCase: boolean;
  defaultSchema?: string;
  schema: DatabaseSchema;
};

const collectSymbol = (name: string, context: TransformContext) => {
  const definition = context.definitions[name];
  if (definition) {
    if (context.symbols.has(name)) {
      return;
    }

    context.symbols.set(name, {
      node: definition,
      type: SymbolType.DEFINITION,
    });
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
      type: SymbolType.MODULE_REFERENCE,
    });
  }
};

const collectSymbols = (
  node: ExpressionNode | TemplateNode,
  context: TransformContext,
) => {
  switch (node.type) {
    case NodeType.ARRAY_EXPRESSION:
      collectSymbols(node.values, context);
      break;
    case NodeType.EXTENDS_CLAUSE:
      collectSymbols(node.test, context);
      collectSymbols(node.consequent, context);
      collectSymbols(node.alternate, context);
      break;
    case NodeType.GENERIC_EXPRESSION: {
      collectSymbol(node.name, context);

      for (const arg of node.args) {
        collectSymbols(arg, context);
      }

      break;
    }
    case NodeType.IDENTIFIER:
      collectSymbol(node.name, context);
      break;
    case NodeType.INFER_CLAUSE:
      break;
    case NodeType.LITERAL:
      break;
    case NodeType.MAPPED_TYPE:
      collectSymbols(node.value, context);
      break;
    case NodeType.OBJECT_EXPRESSION:
      for (const property of node.properties) {
        collectSymbols(property.value, context);
      }

      break;
    case NodeType.TEMPLATE:
      collectSymbols(node.expression, context);
      break;
    case NodeType.UNION_EXPRESSION:
      for (const arg of node.args) {
        collectSymbols(arg, context);
      }

      break;
  }
};

const createContext = (options: TransformOptions): TransformContext => {
  return {
    camelCase: options.camelCase,
    defaultScalar:
      options.adapter.defaultScalar ?? new IdentifierNode('unknown'),
    defaultSchema: options.defaultSchema ?? options.adapter.defaultSchema,
    definitions: {
      ...GLOBAL_DEFINITIONS,
      ...options.adapter.definitions,
    },
    enums: options.schema.enums,
    imports: {
      ...GLOBAL_IMPORTS,
      ...options.adapter.imports,
    },
    schema: options.schema,
    scalars: {
      ...options.adapter.scalars,
    },
    symbols: new SymbolCollection(),
  };
};

const createDatabaseExportNode = (context: TransformContext) => {
  const tableProperties: PropertyNode[] = [];

  for (const table of context.schema.tables) {
    const identifier = getTableIdentifier(table, context);
    const symbolName = context.symbols.getName(identifier);

    if (symbolName) {
      const value = new IdentifierNode(symbolName);
      const tableProperty = new PropertyNode(identifier, value);
      tableProperties.push(tableProperty);
    }
  }

  tableProperties.sort((a, b) => a.key.localeCompare(b.key));

  const body = new ObjectExpressionNode(tableProperties);
  const argument = new InterfaceDeclarationNode('DB', body);
  return new ExportStatementNode(argument);
};

const createDefinitionNodes = (context: TransformContext) => {
  const definitionNodes: ExportStatementNode[] = [];

  for (const { name, symbol } of context.symbols.entries()) {
    if (symbol.type === SymbolType.DEFINITION) {
      const argument = new AliasDeclarationNode(name, symbol.node);
      const definitionNode = new ExportStatementNode(argument);
      definitionNodes.push(definitionNode);
    }
  }

  return definitionNodes.sort((a, b) =>
    a.argument.name.localeCompare(b.argument.name),
  );
};

const createImportNodes = (context: TransformContext) => {
  const imports: { [K in string]?: ImportClauseNode[] } = {};
  const importNodes: ImportStatementNode[] = [];

  for (const { id, name, symbol } of context.symbols.entries()) {
    if (symbol.type === SymbolType.MODULE_REFERENCE) {
      (imports[symbol.node.name] ??= []).push(
        new ImportClauseNode(id, name === id ? null : name),
      );
    }
  }

  for (const [moduleName, symbolImports] of Object.entries(imports)) {
    importNodes.push(new ImportStatementNode(moduleName, symbolImports!));
  }

  return importNodes.sort((a, b) => a.moduleName.localeCompare(b.moduleName));
};

const getTableIdentifier = (table: TableSchema, context: TransformContext) => {
  const name =
    table.schema &&
    context.defaultSchema &&
    table.schema !== context.defaultSchema
      ? `${table.schema}.${table.name}`
      : table.name;
  return transformName(name, context);
};

const transformColumn = (column: ColumnSchema, context: TransformContext) => {
  let args = transformColumnToArgs(column, context);

  if (column.isArray) {
    const unionizedArgs = unionize(args);
    const isSimpleNode =
      unionizedArgs.type === NodeType.IDENTIFIER &&
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
  column: ColumnSchema,
  context: TransformContext,
) => {
  const dataType = column.dataType.toLowerCase();
  const scalarNode = context.scalars[dataType];

  if (scalarNode) {
    return [scalarNode];
  }

  // Used as a unique identifier for the data type:
  const dataTypeId = `${
    column.dataTypeSchema ?? context.defaultSchema
  }.${dataType}`;

  // Used for serializing the name of the symbol:
  const symbolId =
    column.dataTypeSchema && column.dataTypeSchema !== context.defaultSchema
      ? `${column.dataTypeSchema}.${dataType}`
      : dataType;

  const enumValues = context.enums.get(dataTypeId);

  if (enumValues.length > 0) {
    const enumNode = unionize(transformEnum(enumValues));
    const symbolName = context.symbols.set(symbolId, {
      node: enumNode,
      type: SymbolType.DEFINITION,
    });
    const node = new IdentifierNode(symbolName);
    return [node];
  }

  const symbolName = context.symbols.getName(symbolId);

  if (symbolName) {
    const node = new IdentifierNode(symbolName ?? 'unknown');
    return [node];
  }

  if (column.enumValues.length > 0) {
    return transformEnum(column.enumValues);
  }

  return [context.defaultScalar];
};

const transformEnum = (enumValues: string[]) => {
  return enumValues.map((enumValue) => new LiteralNode(enumValue));
};

const transformName = (name: string, context: TransformContext) => {
  return context.camelCase ? toCamelCase(name) : name;
};

const transformTables = (context: TransformContext) => {
  const tableNodes: ExportStatementNode[] = [];

  for (const table of context.schema.tables) {
    const tableProperties: PropertyNode[] = [];

    for (const column of table.columns) {
      const key = transformName(column.name, context);
      const value = transformColumn(column, context);
      const tableProperty = new PropertyNode(key, value);
      tableProperties.push(tableProperty);
    }

    const expression = new ObjectExpressionNode(tableProperties);
    const identifier = getTableIdentifier(table, context);
    const symbolName = context.symbols.set(identifier, {
      type: SymbolType.TABLE,
    });
    const tableNode = new ExportStatementNode(
      new InterfaceDeclarationNode(symbolName, expression),
    );
    tableNodes.push(tableNode);
  }

  tableNodes.sort((a, b) => a.argument.name.localeCompare(b.argument.name));

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

/**
 * Transforms database schema into a TypeScript-compatible AST.
 */
export const transform = (options: TransformOptions) => {
  const context = createContext(options);
  const tableNodes = transformTables(context);
  const importNodes = createImportNodes(context);
  const definitionNodes = createDefinitionNodes(context);
  const databaseNode = createDatabaseExportNode(context);

  return [...importNodes, ...definitionNodes, ...tableNodes, databaseNode];
};

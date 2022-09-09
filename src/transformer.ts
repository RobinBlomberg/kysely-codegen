import { ColumnMetadata, TableMetadata } from 'kysely';
import { AdapterDefinitions, AdapterImports, AdapterTypes } from './adapter';
import { toCamelCase } from './case-converter';
import { Definition, GLOBAL_DEFINITIONS } from './constants/definitions';
import { GLOBAL_IMPORTS } from './constants/imports';
import { Dialect } from './dialect';
import { NodeType } from './enums/node-type';
import { StatementNode } from './nodes';
import { AliasDeclarationNode } from './nodes/alias-declaration-node';
import { DeclarationNode } from './nodes/declaration-node';
import { ExportStatementNode } from './nodes/export-statement-node';
import { ExpressionNode } from './nodes/expression-node';
import { GenericExpressionNode } from './nodes/generic-expression-node';
import { IdentifierNode } from './nodes/identifier-node';
import { ImportStatementNode } from './nodes/import-statement-node';
import { InterfaceDeclarationNode } from './nodes/interface-declaration-node';
import { ObjectExpressionNode } from './nodes/object-expression-node';
import { PropertyNode } from './nodes/property-node';
import { UnionExpressionNode } from './nodes/union-expression-node';

const SYMBOLS: { [K in string]?: boolean } = Object.fromEntries(
  Object.keys(GLOBAL_DEFINITIONS).map((key) => [key, false]),
);

const initialize = (dialect: Dialect) => {
  return {
    declarationNodes: [],
    defaultType: dialect.adapter.defaultType ?? new IdentifierNode('unknown'),
    definitions: { ...GLOBAL_DEFINITIONS, ...dialect.adapter.definitions },
    exportedProperties: [],
    imported: {},
    imports: { ...GLOBAL_IMPORTS, ...dialect.adapter.imports },
    symbols: { ...SYMBOLS },
    types: dialect.adapter.types ?? {},
  };
};

/**
 * Converts table metadata to a codegen AST.
 */
export class Transformer {
  readonly #camelCase: boolean;
  readonly #dialect: Dialect;

  #declarationNodes: DeclarationNode[];
  #defaultType: ExpressionNode;
  #definitions: AdapterDefinitions;
  #exportedProperties: PropertyNode[];
  #imported: Record<string, Set<string>>;
  #imports: AdapterImports;
  #symbols: typeof SYMBOLS;
  #types: AdapterTypes;

  constructor(dialect: Dialect, camelCase: boolean) {
    this.#camelCase = camelCase;
    this.#dialect = dialect;

    const options = initialize(dialect);

    this.#declarationNodes = options.declarationNodes;
    this.#defaultType = options.defaultType;
    this.#definitions = options.definitions;
    this.#exportedProperties = options.exportedProperties;
    this.#imported = options.imported;
    this.#imports = options.imports;
    this.#symbols = options.symbols;
    this.#types = options.types;
  }

  #createSymbolName(table: TableMetadata) {
    let symbolName = this.#dialect.getSymbolName(table);

    if (this.#symbols[symbolName] !== undefined) {
      let suffix = 2;

      while (this.#symbols[`${symbolName}${suffix}`] !== undefined) {
        suffix++;
      }

      symbolName += suffix;
    }

    return symbolName;
  }

  #declareDefinition(name: string, definition: Definition) {
    if (this.#symbols[name]) {
      return;
    }

    const [generics, expression] = Array.isArray(definition)
      ? definition
      : [[], definition];

    this.#declareSymbol(name);

    if (expression.type === NodeType.OBJECT_EXPRESSION) {
      this.#declarationNodes.push(
        new InterfaceDeclarationNode(name, expression),
      );
    } else {
      this.#declareSymbol(name);
      this.#instantiateReferencedSymbols(expression);
      this.#declarationNodes.push(
        new AliasDeclarationNode(name, generics, expression),
      );
    }
  }

  #declareSymbol(name: string) {
    this.#symbols[name] = true;
  }

  #instantiateReferencedSymbol(name: string) {
    const definition = this.#definitions[name];
    if (definition && !this.#symbols[name]) {
      this.#declareDefinition(name, definition);
      return;
    }

    const importModuleName = this.#imports[name];
    if (importModuleName) {
      this.#declareSymbol(name);
      this.#imported[importModuleName] ??= new Set();
      this.#imported[importModuleName]!.add(name);
    }
  }

  #instantiateReferencedSymbols(node: ExpressionNode) {
    switch (node.type) {
      case NodeType.ARRAY_EXPRESSION:
        this.#instantiateReferencedSymbols(node.values);
        break;
      case NodeType.EXTENDS_CLAUSE:
        this.#instantiateReferencedSymbols(node.test);
        this.#instantiateReferencedSymbols(node.consequent);
        this.#instantiateReferencedSymbols(node.alternate);
        break;
      case NodeType.GENERIC_EXPRESSION: {
        this.#instantiateReferencedSymbol(node.name);

        for (const arg of node.args) {
          this.#instantiateReferencedSymbols(arg);
        }

        break;
      }
      case NodeType.IDENTIFIER:
        this.#instantiateReferencedSymbol(node.name);
        break;
      case NodeType.INFER_CLAUSE:
        break;
      case NodeType.MAPPED_TYPE:
        this.#instantiateReferencedSymbols(node.value);
        break;
      case NodeType.OBJECT_EXPRESSION:
        for (const property of node.properties) {
          this.#instantiateReferencedSymbols(property.value);
        }
        break;
      case NodeType.UNION_EXPRESSION:
        for (const arg of node.args) {
          this.#instantiateReferencedSymbols(arg);
        }
        break;
    }
  }

  #transformColumn(column: ColumnMetadata) {
    const node = this.#types[column.dataType] ?? this.#defaultType;
    const args: ExpressionNode[] = [node];

    if (column.isNullable) {
      args.push(new IdentifierNode('null'));
    }

    const key = this.#camelCase ? toCamelCase(column.name) : column.name;

    let value = args.length === 1 ? args[0]! : new UnionExpressionNode(args);

    if (column.hasDefaultValue || column.isAutoIncrementing) {
      value = new GenericExpressionNode('Generated', [value]);
    }

    this.#instantiateReferencedSymbols(value);

    return new PropertyNode(key, value);
  }

  #transformDatabaseExport() {
    return new ExportStatementNode(
      new InterfaceDeclarationNode(
        'DB',
        new ObjectExpressionNode(this.#exportedProperties),
      ),
    );
  }

  #transformDeclarations() {
    return this.#declarationNodes
      .sort((a, b) => {
        return a.type === b.type
          ? a.name.localeCompare(b.name)
          : a.type.localeCompare(b.type);
      })
      .map((node) => new ExportStatementNode(node));
  }

  #transformImports() {
    return Object.entries(this.#imported).map(([moduleName, importNames]) => {
      return new ImportStatementNode(moduleName, [...importNames]);
    });
  }

  #transformTables(tables: TableMetadata[]) {
    const nodes: ExportStatementNode[] = [];

    for (const table of tables) {
      const tableSymbolName = this.#createSymbolName(table);
      const propertyNodes: PropertyNode[] = [];

      this.#declareSymbol(tableSymbolName);

      const valueNode = new IdentifierNode(tableSymbolName);
      const key = this.#dialect.getExportedTableName(table, this.#camelCase);
      const exportedPropertyNode = new PropertyNode(key, valueNode);

      this.#exportedProperties.push(exportedPropertyNode);

      for (const column of table.columns) {
        const propertyNode = this.#transformColumn(column);
        propertyNodes.push(propertyNode);
      }

      const objectNode = new ObjectExpressionNode(propertyNodes);
      const interfaceNode = new InterfaceDeclarationNode(
        tableSymbolName,
        objectNode,
      );
      const exportStatementNode = new ExportStatementNode(interfaceNode);

      nodes.push(exportStatementNode);
    }

    return nodes;
  }

  transform(tables: TableMetadata[]): StatementNode[] {
    const options = initialize(this.#dialect);

    this.#declarationNodes = options.declarationNodes;
    this.#defaultType = options.defaultType;
    this.#definitions = options.definitions;
    this.#exportedProperties = options.exportedProperties;
    this.#imported = options.imported;
    this.#imports = options.imports;
    this.#symbols = options.symbols;
    this.#types = options.types;

    const tableExportNodes = this.#transformTables(tables);
    const importNodes = this.#transformImports();
    const definitionExportNodes = this.#transformDeclarations();
    const databaseExportNode = this.#transformDatabaseExport();
    const exportNodes = [
      ...definitionExportNodes,
      ...tableExportNodes,
      databaseExportNode,
    ];

    return [...importNodes, ...exportNodes];
  }
}

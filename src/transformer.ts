import { Definitions, Imports, Scalars } from './adapter';
import { toCamelCase } from './case-converter';
import { EnumCollection, SymbolCollection, SymbolType } from './collections';
import { GLOBAL_DEFINITIONS, GLOBAL_IMPORTS } from './constants';
import { Dialect } from './dialect';
import { NodeType } from './enums';
import { ColumnMetadata, DatabaseMetadata, TableMetadata } from './metadata';
import {
  AliasDeclarationNode,
  ArrayExpressionNode,
  ExportStatementNode,
  ExpressionNode,
  GenericExpressionNode,
  IdentifierNode,
  ImportClauseNode,
  ImportStatementNode,
  InterfaceDeclarationNode,
  LiteralNode,
  ObjectExpressionNode,
  PropertyNode,
  TemplateNode,
} from './nodes';
import { unionize } from './utils';

export type TransformContext = {
  camelCase: boolean;
  defaultScalar: ExpressionNode;
  defaultSchema: string | null;
  definitions: Definitions;
  enums: EnumCollection;
  imports: Imports;
  metadata: DatabaseMetadata;
  scalars: Scalars;
  symbols: SymbolCollection;
};

export type TransformOptions = {
  camelCase: boolean;
  defaultSchema?: string;
  dialect: Dialect;
  metadata: DatabaseMetadata;
};

/**
 * Transforms database metadata into a TypeScript-compatible AST.
 */
export class Transformer {
  #collectSymbol(name: string, context: TransformContext) {
    const definition = context.definitions[name];
    if (definition) {
      if (context.symbols.has(name)) {
        return;
      }

      context.symbols.set(name, {
        node: definition,
        type: SymbolType.DEFINITION,
      });
      this.#collectSymbols(definition, context);
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
  }

  #collectSymbols(
    node: ExpressionNode | TemplateNode,
    context: TransformContext,
  ) {
    switch (node.type) {
      case NodeType.ARRAY_EXPRESSION:
        this.#collectSymbols(node.values, context);
        break;
      case NodeType.EXTENDS_CLAUSE:
        this.#collectSymbols(node.test, context);
        this.#collectSymbols(node.consequent, context);
        this.#collectSymbols(node.alternate, context);
        break;
      case NodeType.GENERIC_EXPRESSION: {
        this.#collectSymbol(node.name, context);

        for (const arg of node.args) {
          this.#collectSymbols(arg, context);
        }

        break;
      }
      case NodeType.IDENTIFIER:
        this.#collectSymbol(node.name, context);
        break;
      case NodeType.INFER_CLAUSE:
        break;
      case NodeType.LITERAL:
        break;
      case NodeType.MAPPED_TYPE:
        this.#collectSymbols(node.value, context);
        break;
      case NodeType.OBJECT_EXPRESSION:
        for (const property of node.properties) {
          this.#collectSymbols(property.value, context);
        }

        break;
      case NodeType.TEMPLATE:
        this.#collectSymbols(node.expression, context);
        break;
      case NodeType.UNION_EXPRESSION:
        for (const arg of node.args) {
          this.#collectSymbols(arg, context);
        }

        break;
    }
  }

  #createContext(options: TransformOptions): TransformContext {
    return {
      camelCase: options.camelCase,
      defaultScalar:
        options.dialect.adapter.defaultScalar ?? new IdentifierNode('unknown'),
      defaultSchema:
        options.defaultSchema ?? options.dialect.adapter.defaultSchema,
      definitions: {
        ...GLOBAL_DEFINITIONS,
        ...options.dialect.adapter.definitions,
      },
      enums: options.metadata.enums,
      imports: {
        ...GLOBAL_IMPORTS,
        ...options.dialect.adapter.imports,
      },
      metadata: options.metadata,
      scalars: {
        ...options.dialect.adapter.scalars,
      },
      symbols: new SymbolCollection(),
    };
  }

  #createDatabaseExportNode(context: TransformContext) {
    const tableProperties: PropertyNode[] = [];

    for (const table of context.metadata.tables) {
      const identifier = this.#getTableIdentifier(table, context);
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
  }

  #createDefinitionNodes(context: TransformContext) {
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
  }

  #createImportNodes(context: TransformContext) {
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
  }

  #getTableIdentifier(table: TableMetadata, context: TransformContext) {
    const name =
      table.schema &&
      context.defaultSchema &&
      table.schema !== context.defaultSchema
        ? `${table.schema}.${table.name}`
        : table.name;
    return this.#transformName(name, context);
  }

  #transformColumn(column: ColumnMetadata, context: TransformContext) {
    let args = this.#transformColumnToArgs(column, context);

    if (column.isArray) {
      args = [new ArrayExpressionNode(unionize(args))];
    }

    if (column.isNullable) {
      args.push(new IdentifierNode('null'));
    }

    let node = unionize(args);

    const isGenerated = column.hasDefaultValue || column.isAutoIncrementing;
    if (isGenerated) {
      node = new GenericExpressionNode('Generated', [node]);
    }

    this.#collectSymbols(node, context);

    return node;
  }

  #transformColumnToArgs(column: ColumnMetadata, context: TransformContext) {
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

    if (enumValues) {
      const enumNode = unionize(this.#transformEnum(enumValues));
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

    if (column.enumValues) {
      return this.#transformEnum(column.enumValues);
    }

    return [context.defaultScalar];
  }

  #transformEnum(enumValues: string[]) {
    return enumValues.map((enumValue) => new LiteralNode(enumValue));
  }

  #transformName(name: string, context: TransformContext) {
    return context.camelCase ? toCamelCase(name) : name;
  }

  #transformTables(context: TransformContext) {
    const tableNodes: ExportStatementNode[] = [];

    for (const table of context.metadata.tables) {
      const tableProperties: PropertyNode[] = [];

      for (const column of table.columns) {
        const key = this.#transformName(column.name, context);
        const value = this.#transformColumn(column, context);
        const tableProperty = new PropertyNode(key, value);
        tableProperties.push(tableProperty);
      }

      const expression = new ObjectExpressionNode(tableProperties);
      const identifier = this.#getTableIdentifier(table, context);
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
  }

  transform(options: TransformOptions) {
    const context = this.#createContext(options);
    const tableNodes = this.#transformTables(context);
    const importNodes = this.#createImportNodes(context);
    const definitionNodes = this.#createDefinitionNodes(context);
    const databaseNode = this.#createDatabaseExportNode(context);

    return [...importNodes, ...definitionNodes, ...tableNodes, databaseNode];
  }
}

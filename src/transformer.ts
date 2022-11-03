import { Definitions, Imports, Scalars } from './adapter';
import { toCamelCase } from './case-converter';
import { EnumCollection, SymbolCollection, SymbolType } from './collections';
import { GLOBAL_DEFINITIONS, GLOBAL_IMPORTS } from './constants';
import { Dialect } from './dialect';
import { NodeType } from './enums';
import { ColumnMetadata, DatabaseMetadata, TableMetadata } from './metadata';
import {
  AliasDeclarationNode,
  ArrayNode,
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
      defaultSchema: options.dialect.adapter.defaultSchema,
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

  #getTableKey(column: ColumnMetadata, context: TransformContext) {
    return context.camelCase ? toCamelCase(column.name) : column.name;
  }

  #getTableIdentifier(table: TableMetadata, context: TransformContext) {
    return table.schema &&
      context.defaultSchema &&
      table.schema !== context.defaultSchema
      ? `${table.schema}.${table.name}`
      : table.name;
  }

  #transformColumn(
    column: ColumnMetadata,
    context: TransformContext,
    schema?: string,
  ) {
    const args: ExpressionNode[] = [];
    let enumValues: string[] | undefined;
    let node: ExpressionNode;
    let scalarNode: ExpressionNode | undefined;
    let symbolName: string | undefined;

    if ((scalarNode = context.scalars[column.dataType])) {
      args.push(scalarNode);
    } else if (
      (enumValues = context.enums.get(`${schema}.${column.dataType}`))
    ) {
      const enumSymbolName = context.symbols.set(column.dataType, {
        node: unionize(
          enumValues.map((enumValue) => new LiteralNode(enumValue)),
        ),
        type: SymbolType.DEFINITION,
      });
      args.push(new IdentifierNode(enumSymbolName));
    } else if ((symbolName = context.symbols.getName(column.dataType))) {
      args.push(new IdentifierNode(symbolName ?? 'unknown'));
    } else if (column.enumValues) {
      for (const value of column.enumValues) {
        args.push(new LiteralNode(value));
      }
    } else {
      args.push(context.defaultScalar);
    }

    if (column.isArray) {
      for (const [index, arg] of args.entries()) {
        args[index] = new ArrayNode(arg);
      }
    }

    if (column.isNullable) {
      args.push(new IdentifierNode('null'));
    }

    node = unionize(args);

    if (column.hasDefaultValue || column.isAutoIncrementing) {
      node = new GenericExpressionNode('Generated', [node]);
    }

    this.#collectSymbols(node, context);

    return node;
  }

  #transformTables(context: TransformContext) {
    const tableNodes: ExportStatementNode[] = [];

    for (const table of context.metadata.tables) {
      const tableProperties: PropertyNode[] = [];

      for (const column of table.columns) {
        const key = this.#getTableKey(column, context);
        const value = this.#transformColumn(column, context, table.schema);
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

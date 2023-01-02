import { NodeType } from './enums';
import {
  AliasDeclarationNode,
  ArrayExpressionNode,
  ExportStatementNode,
  ExpressionNode,
  ExtendsClauseNode,
  GenericExpressionNode,
  IdentifierNode,
  ImportClauseNode,
  ImportStatementNode,
  InferClauseNode,
  InterfaceDeclarationNode,
  LiteralNode,
  MappedTypeNode,
  ObjectExpressionNode,
  PropertyNode,
  StatementNode,
  UnionExpressionNode,
} from './nodes';

const IDENTIFIER_REGEXP = /^[a-zA-Z_$][a-zA-Z_0-9$]*$/;

export type SerializerOptions = {
  typeOnlyImports?: boolean;
};

/**
 * Creates a TypeScript output string from a codegen AST.
 */
export class Serializer {
  readonly typeOnlyImports: boolean;

  constructor(options: SerializerOptions = {}) {
    this.typeOnlyImports = options.typeOnlyImports ?? true;
  }

  serialize(nodes: StatementNode[]) {
    let data = '';
    let i = 0;

    for (const node of nodes) {
      if (i >= 1) {
        data += '\n';

        if (node.type !== NodeType.IMPORT_STATEMENT) {
          data += '\n';
        }
      }

      switch (node.type) {
        case NodeType.EXPORT_STATEMENT:
          data += this.serializeExportStatement(node);
          break;
        case NodeType.IMPORT_STATEMENT:
          data += this.serializeImportStatement(node);
          break;
      }

      i++;
    }

    data += '\n';

    return data;
  }

  serializeAliasDeclaration(node: AliasDeclarationNode) {
    const expression =
      node.body.type === NodeType.TEMPLATE ? node.body.expression : node.body;
    let data = '';

    data += 'type ';
    data += node.name;

    if (node.body.type === NodeType.TEMPLATE) {
      data += '<';

      for (let i = 0; i < node.body.params.length; i++) {
        if (i >= 1) {
          data += ', ';
        }

        data += node.body.params[i]!;
      }

      data += '>';
    }

    data += ' = ';
    data += this.serializeExpression(expression);
    data += ';';

    return data;
  }

  serializeArrayExpression(node: ArrayExpressionNode) {
    const shouldParenthesize =
      node.values.type === NodeType.UNION_EXPRESSION &&
      node.values.args.length >= 2;
    let data = '';

    if (shouldParenthesize) {
      data += '(';
    }

    data += this.serializeExpression(node.values);

    if (shouldParenthesize) {
      data += ')';
    }

    data += '[]';

    return data;
  }

  serializeExportStatement(node: ExportStatementNode) {
    let data = '';

    data += 'export ';

    switch (node.argument.type) {
      case NodeType.ALIAS_DECLARATION:
        data += this.serializeAliasDeclaration(node.argument);
        break;
      case NodeType.INTERFACE_DECLARATION:
        data += this.serializeInterfaceDeclaration(node.argument);
        break;
    }

    return data;
  }

  serializeExpression(node: ExpressionNode) {
    switch (node.type) {
      case NodeType.ARRAY_EXPRESSION:
        return this.serializeArrayExpression(node);
      case NodeType.EXTENDS_CLAUSE:
        return this.serializeExtendsClause(node);
      case NodeType.GENERIC_EXPRESSION:
        return this.serializeGenericExpression(node);
      case NodeType.IDENTIFIER:
        return this.serializeIdentifier(node);
      case NodeType.INFER_CLAUSE:
        return this.serializeInferClause(node);
      case NodeType.LITERAL:
        return this.serializeLiteral(node);
      case NodeType.MAPPED_TYPE:
        return this.serializeMappedType(node);
      case NodeType.OBJECT_EXPRESSION:
        return this.serializeObjectExpression(node);
      case NodeType.UNION_EXPRESSION:
        return this.serializeUnionExpression(node);
    }
  }

  serializeExtendsClause(node: ExtendsClauseNode) {
    let data = '';

    data += node.name;
    data += ' extends ';
    data += this.serializeExpression(node.test);
    data += '\n  ? ';
    data += this.serializeExpression(node.consequent);
    data += '\n  : ';
    data += this.serializeExpression(node.alternate);

    return data;
  }

  serializeGenericExpression(node: GenericExpressionNode) {
    let data = '';

    data += node.name;
    data += '<';

    for (let i = 0; i < node.args.length; i++) {
      if (i >= 1) {
        data += ', ';
      }

      data += this.serializeExpression(node.args[i]!);
    }

    data += '>';

    return data;
  }

  serializeIdentifier(node: IdentifierNode) {
    return node.name;
  }

  serializeImportClause(node: ImportClauseNode) {
    let data = '';

    data += node.name;

    if (node.alias) {
      data += ' as ';
      data += node.alias;
    }

    return data;
  }

  serializeImportStatement(node: ImportStatementNode) {
    let data = '';
    let i = 0;

    data += 'import ';

    if (this.typeOnlyImports) {
      data += 'type ';
    }

    data += '{';

    for (const importClause of node.imports) {
      if (i >= 1) {
        data += ',';
      }

      data += ' ';
      data += this.serializeImportClause(importClause);
      i++;
    }

    data += ' } from ';
    data += JSON.stringify(node.moduleName);
    data += ';';

    return data;
  }

  serializeInferClause(node: InferClauseNode) {
    let data = '';

    data += 'infer ';
    data += node.name;

    return data;
  }

  serializeInterfaceDeclaration(node: InterfaceDeclarationNode) {
    let data = '';

    data += 'interface ';
    data += node.name;
    data += ' ';
    data += this.serializeObjectExpression(node.body);

    return data;
  }

  serializeLiteral(node: LiteralNode) {
    return JSON.stringify(node.value);
  }

  serializeKey(key: string) {
    return IDENTIFIER_REGEXP.test(key) ? key : JSON.stringify(key);
  }

  serializeMappedType(node: MappedTypeNode) {
    let data = '';

    data += '{\n  [K in string]?: ';
    data += this.serializeExpression(node.value);
    data += ';\n}';

    return data;
  }

  serializeObjectExpression(node: ObjectExpressionNode) {
    let data = '';

    data += '{';

    if (node.properties.length) {
      data += '\n';

      for (const property of node.properties) {
        data += '  ';
        data += this.serializeProperty(property);
      }
    }

    data += '}';

    return data;
  }

  serializeProperty(node: PropertyNode) {
    let data = '';

    data += this.serializeKey(node.key);
    data += ': ';
    data += this.serializeExpression(node.value);
    data += ';\n';

    return data;
  }

  serializeUnionExpression(node: UnionExpressionNode) {
    let data = '';
    let i = 0;

    for (const arg of node.args) {
      if (i >= 1) {
        data += ' | ';
      }

      data += this.serializeExpression(arg);
      i++;
    }

    return data;
  }
}

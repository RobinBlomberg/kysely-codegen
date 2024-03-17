import type {
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
  RuntimeEnumDeclarationNode,
  StatementNode,
  UnionExpressionNode,
} from '../ast';
import { NodeType } from '../ast';
import { toCamelCase } from '../transformer';

const IDENTIFIER_REGEXP = /^[$A-Z_a-z][\w$]*$/;

export type SerializerOptions = {
  camelCase?: boolean;
  typeOnlyImports?: boolean;
};

/**
 * Creates a TypeScript output string from a codegen AST.
 */
export class Serializer {
  readonly camelCase: boolean;
  readonly typeOnlyImports: boolean;

  constructor(options: SerializerOptions = {}) {
    this.camelCase = options.camelCase ?? false;
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
      node.values.type === NodeType.INFER_CLAUSE ||
      (node.values.type === NodeType.UNION_EXPRESSION &&
        node.values.args.length >= 2);
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
      case NodeType.RUNTIME_ENUM_DECLARATION:
        data += this.serializeRuntimeEnum(node.argument);
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

    data += this.serializeExpression(node.checkType);
    data += ' extends ';
    data += this.serializeExpression(node.extendsType);
    data += '\n  ? ';
    data += this.serializeExpression(node.trueType);
    data += '\n  : ';
    data += this.serializeExpression(node.falseType);

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

    if (node.properties.length > 0) {
      data += '\n';

      const sortedProperties = [...node.properties].sort((a, b) =>
        a.key.localeCompare(b.key),
      );

      for (const property of sortedProperties) {
        data += '  ';
        data += this.serializeProperty(property);
      }
    }

    data += '}';

    return data;
  }

  serializeProperty(node: PropertyNode) {
    let data = '';

    if (node.comment) {
      data += '/**\n';

      for (const line of node.comment.split(/\r?\n/)) {
        data += `   *${line ? ` ${line}` : ''}\n`;
      }

      data += '   */\n  ';
    }

    data += this.serializeKey(node.key);
    data += ': ';
    data += this.serializeExpression(node.value);
    data += ';\n';

    return data;
  }

  serializeRuntimeEnum(node: RuntimeEnumDeclarationNode) {
    let data = 'enum ';

    data += node.name;
    data += ' {\n';

    const args =
      node.body.type === NodeType.UNION_EXPRESSION
        ? node.body.args
        : [node.body];

    args.sort((a, b) => {
      return (a as LiteralNode<string>).value.localeCompare(
        (b as LiteralNode<string>).value,
      );
    });

    for (const arg of args) {
      if (arg.type === NodeType.LITERAL && typeof arg.value === 'string') {
        const serializedArg = this.serializeLiteral(arg);
        const enumValueName = this.camelCase
          ? toCamelCase(arg.value)
          : arg.value;
        data += '  ';
        data += enumValueName;
        data += ' = ';
        data += serializedArg;
        data += ',';
        data += '\n';
      }
    }

    data += '}';

    return data;
  }

  serializeUnionExpression(node: UnionExpressionNode) {
    let data = '';
    let i = 0;

    const sortedArgs = [...node.args].sort((a, b) => {
      if (a.type !== NodeType.IDENTIFIER || b.type !== NodeType.IDENTIFIER) {
        return 0;
      }
      if (a.name === undefined || a.name === 'undefined') return 1;
      if (b.name === undefined || b.name === 'undefined') return -1;
      if (a.name === null || a.name === 'null') return 1;
      if (b.name === null || b.name === 'null') return -1;
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    for (const arg of sortedArgs) {
      if (i >= 1) {
        data += ' | ';
      }

      data += this.serializeExpression(arg);
      i++;
    }

    return data;
  }
}

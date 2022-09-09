import { NodeType } from './enums/node-type';
import { ObjectExpressionNode } from './nodes';
import { AliasDeclarationNode } from './nodes/alias-declaration-node';
import { ArrayExpressionNode } from './nodes/array-expression-node';
import { ExportStatementNode } from './nodes/export-statement-node';
import { ExpressionNode } from './nodes/expression-node';
import { ExtendsClauseNode } from './nodes/extends-clause-node';
import { GenericExpressionNode } from './nodes/generic-expression-node';
import { IdentifierNode } from './nodes/identifier-node';
import { ImportStatementNode } from './nodes/import-statement-node';
import { InferClauseNode } from './nodes/infer-clause-node';
import { InterfaceDeclarationNode } from './nodes/interface-declaration-node';
import { MappedTypeNode } from './nodes/mapped-type-node';
import { PropertyNode } from './nodes/property-node';
import { StatementNode } from './nodes/statement-node';
import { UnionExpressionNode } from './nodes/union-expression-node';

const IDENTIFIER_REGEXP = /^[a-zA-Z_$][a-zA-Z_0-9$]*$/;

/**
 * Creates a TypeScript output string from a codegen AST.
 */
export class Serializer {
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
    let data = '';

    data += 'type ';
    data += node.name;

    if (node.args.length) {
      data += '<';

      for (let i = 0; i < node.args.length; i++) {
        if (i >= 1) {
          data += ', ';
        }

        data += node.args[i]!;
      }

      data += '>';
    }

    data += ' = ';
    data += this.serializeExpression(node.body);
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

  serializeImportStatement(node: ImportStatementNode) {
    let data = '';
    let i = 0;

    data += 'import {';

    for (const importName of node.imports) {
      if (i >= 1) {
        data += ', ';
      }

      data += ' ';
      data += importName;
      i++;
    }

    data += " } from '";
    data += node.moduleName;
    data += "';";

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

    data += '{\n';

    for (const property of node.properties) {
      data += '  ';
      data += this.serializeProperty(property);
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

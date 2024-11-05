import { singular } from 'pluralize';
import type { AliasDeclarationNode } from '../ast/alias-declaration-node';
import type { ArrayExpressionNode } from '../ast/array-expression-node';
import type { EnumExpressionNode } from '../ast/enum-expression-node';
import type { ExportStatementNode } from '../ast/export-statement-node';
import type { ExpressionNode } from '../ast/expression-node';
import type { ExtendsClauseNode } from '../ast/extends-clause-node';
import type { GenericExpressionNode } from '../ast/generic-expression-node';
import type { IdentifierNode } from '../ast/identifier-node';
import type { ImportClauseNode } from '../ast/import-clause-node';
import type { ImportStatementNode } from '../ast/import-statement-node';
import type { InferClauseNode } from '../ast/infer-clause-node';
import type { InterfaceDeclarationNode } from '../ast/interface-declaration-node';
import type { LiteralNode } from '../ast/literal-node';
import type { MappedTypeNode } from '../ast/mapped-type-node';
import { NodeType } from '../ast/node-type';
import type { ObjectExpressionNode } from '../ast/object-expression-node';
import type { PropertyNode } from '../ast/property-node';
import type { RawExpressionNode } from '../ast/raw-expression-node';
import type { RuntimeEnumDeclarationNode } from '../ast/runtime-enum-declaration-node';
import type { StatementNode } from '../ast/statement-node';
import type { UnionExpressionNode } from '../ast/union-expression-node';
import { toPascalCase, toScreamingSnakeCase } from '../utils/case-converter';
import { RuntimeEnumsStyle } from './runtime-enums-style';

const IDENTIFIER_REGEXP = /^[$A-Z_a-z][\w$]*$/;

type SerializerOptions = {
  camelCase?: boolean;
  runtimeEnumsStyle?: RuntimeEnumsStyle;
  singular?: boolean;
  typeOnlyImports?: boolean;
};

/**
 * Creates a TypeScript output string from a codegen AST.
 */
export class Serializer {
  readonly camelCase: boolean;
  readonly runtimeEnumsStyle?: RuntimeEnumsStyle;
  readonly singular: boolean;
  readonly typeOnlyImports: boolean;

  constructor(options: SerializerOptions = {}) {
    this.camelCase = options.camelCase ?? false;
    this.runtimeEnumsStyle = options.runtimeEnumsStyle;
    this.singular = options.singular ?? false;
    this.typeOnlyImports = options.typeOnlyImports ?? true;
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
      case NodeType.RAW_EXPRESSION:
        return this.serializeRawExpression(node);
      case NodeType.UNION_EXPRESSION:
      case NodeType.ENUM_EXPRESSION:
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

  serializeFile(nodes: StatementNode[]) {
    let data = '';

    data += '/**\n';
    data += ' * This file was generated by kysely-codegen.\n';
    data += ' * Please do not edit it manually.\n';
    data += ' */\n\n';
    data += this.serializeStatements(nodes);

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
    if (node.name.length <= 1) {
      return node.name;
    }

    return this.singular ? singular(node.name) : node.name;
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
    data += this.singular ? singular(node.name) : node.name;
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

    data += '{\n  [x: string]: ';
    data += this.serializeExpression(node.value);
    data += ' | undefined;\n}';

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

  serializeRawExpression(node: RawExpressionNode) {
    return node.expression;
  }

  serializeRuntimeEnum(node: RuntimeEnumDeclarationNode) {
    let data = 'enum ';

    data += node.name;
    data += ' {\n';

    const members = [...node.members].sort(([a], [b]) => {
      return a.localeCompare(b);
    });

    for (const member of members) {
      data += '  ';

      if (this.runtimeEnumsStyle === RuntimeEnumsStyle.PASCAL_CASE) {
        data += toPascalCase(member[0]);
      } else {
        data += toScreamingSnakeCase(member[0]);
      }

      data += ' = ';
      data += this.serializeLiteral(member[1]);
      data += ',';
      data += '\n';
    }

    data += '}';

    return data;
  }

  serializeStatements(nodes: StatementNode[]) {
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

  serializeUnionExpression(node: UnionExpressionNode | EnumExpressionNode) {
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

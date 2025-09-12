import * as ts from 'typescript';
import { GenericExpressionNode } from '../ast/generic-expression-node';
import { IdentifierNode } from '../ast/identifier-node';
import { UnionExpressionNode } from '../ast/union-expression-node';
import { LiteralNode } from '../ast/literal-node';
import { RawExpressionNode } from '../ast/raw-expression-node';
import type { ExpressionNode } from '../ast/expression-node';

/**
 * Parses a TypeScript type expression string into kysely-codegen AST nodes.
 * This properly handles all TypeScript syntax including generics, unions,
 * intersections, and complex nested types.
 */
export class TypeExpressionParser {
  private sourceFile!: ts.SourceFile;

  /**
   * Parse a TypeScript type expression string into AST nodes
   * @param typeExpression - The type expression string (e.g., "JSONColumnType<CustomType>")
   * @returns The parsed AST node, or RawExpressionNode if parsing fails
   */
  parse(typeExpression: string): ExpressionNode {
    // Handle empty string edge case
    if (!typeExpression.trim()) {
      return new RawExpressionNode(typeExpression);
    }

    try {
      // Wrap the type in a type alias to make it a valid TypeScript statement
      const sourceText = `type __T = ${typeExpression};`;

      // Create a TypeScript source file
      this.sourceFile = ts.createSourceFile(
        'temp.ts',
        sourceText,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );

      // Find the type alias declaration
      const typeAlias = this.sourceFile.statements.find((stmt) =>
        ts.isTypeAliasDeclaration(stmt),
      );

      if (!typeAlias) {
        return new RawExpressionNode(typeExpression);
      }

      // Convert the TypeScript AST to kysely-codegen AST
      return this.convertTypeNode(typeAlias.type);
    } catch (error) {
      // If parsing fails for any reason, fall back to RawExpressionNode
      console.warn(`Failed to parse type expression: ${typeExpression}`, error);
      return new RawExpressionNode(typeExpression);
    }
  }

  /**
   * Extract all type identifiers from a type expression
   * This is used for import collection
   */
  extractTypeIdentifiers(typeExpression: string): string[] {
    // Handle empty string edge case
    if (!typeExpression.trim()) {
      return [];
    }

    try {
      const sourceText = `type __T = ${typeExpression};`;
      this.sourceFile = ts.createSourceFile(
        'temp.ts',
        sourceText,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );

      const typeAlias = this.sourceFile.statements.find((stmt) =>
        ts.isTypeAliasDeclaration(stmt),
      );

      if (!typeAlias) {
        return [];
      }

      const identifiers = new Set<string>();
      this.collectTypeReferences(typeAlias.type, identifiers);
      return Array.from(identifiers);
    } catch {
      return [];
    }
  }

  private collectTypeReferences(
    node: ts.TypeNode,
    identifiers: Set<string>,
  ): void {
    if (ts.isTypeReferenceNode(node)) {
      const typeName = node.typeName.getText(this.sourceFile);
      identifiers.add(typeName);

      // Also collect type arguments
      if (node.typeArguments) {
        for (const arg of node.typeArguments) {
          this.collectTypeReferences(arg, identifiers);
        }
      }
    } else if (ts.isUnionTypeNode(node)) {
      for (const type of node.types) {
        this.collectTypeReferences(type, identifiers);
      }
    } else if (ts.isIntersectionTypeNode(node)) {
      for (const type of node.types) {
        this.collectTypeReferences(type, identifiers);
      }
    } else if (ts.isArrayTypeNode(node)) {
      this.collectTypeReferences(node.elementType, identifiers);
    } else if (ts.isTupleTypeNode(node)) {
      for (const element of node.elements) {
        if (ts.isNamedTupleMember(element)) {
          this.collectTypeReferences(element.type, identifiers);
        } else {
          this.collectTypeReferences(element, identifiers);
        }
      }
    } else if (ts.isConditionalTypeNode(node)) {
      this.collectTypeReferences(node.checkType, identifiers);
      this.collectTypeReferences(node.extendsType, identifiers);
      this.collectTypeReferences(node.trueType, identifiers);
      this.collectTypeReferences(node.falseType, identifiers);
    } else if (ts.isMappedTypeNode(node)) {
      if (node.type) {
        this.collectTypeReferences(node.type, identifiers);
      }
    } else if (ts.isIndexedAccessTypeNode(node)) {
      this.collectTypeReferences(node.objectType, identifiers);
      this.collectTypeReferences(node.indexType, identifiers);
    } else if (ts.isParenthesizedTypeNode(node)) {
      this.collectTypeReferences(node.type, identifiers);
    }
    // Note: We don't collect from literal types, keyword types, etc.
  }

  private convertTypeNode(node: ts.TypeNode): ExpressionNode {
    // For complex types (arrays, intersections, object types), preserve the original syntax
    // by using RawExpressionNode. This maintains output fidelity.
    if (
      ts.isArrayTypeNode(node) ||
      ts.isIntersectionTypeNode(node) ||
      ts.isTypeLiteralNode(node)
    ) {
      const typeText = node.getText(this.sourceFile);
      return new RawExpressionNode(typeText);
    }

    if (ts.isTypeReferenceNode(node)) {
      const typeName = node.typeName.getText(this.sourceFile);

      if (node.typeArguments && node.typeArguments.length > 0) {
        // Generic type like JSONColumnType<CustomType>
        const args = node.typeArguments.map((arg) => this.convertTypeNode(arg));
        return new GenericExpressionNode(typeName, args);
      }
      // Simple identifier
      return new IdentifierNode(typeName);
    } else if (ts.isUnionTypeNode(node)) {
      // Union type like A | B | C
      const types = node.types.map((type) => this.convertTypeNode(type));
      return types.length === 1 ? types[0]! : new UnionExpressionNode(types);
    } else if (ts.isLiteralTypeNode(node)) {
      // String literal type like "active" | "inactive"
      if (ts.isStringLiteral(node.literal)) {
        return new LiteralNode(node.literal.text);
      } else if (node.literal.kind === ts.SyntaxKind.NullKeyword) {
        return new IdentifierNode('null');
      } else if (node.literal.kind === ts.SyntaxKind.TrueKeyword) {
        return new IdentifierNode('true');
      } else if (node.literal.kind === ts.SyntaxKind.FalseKeyword) {
        return new IdentifierNode('false');
      } else if (ts.isNumericLiteral(node.literal)) {
        return new LiteralNode(Number(node.literal.text));
      }
    } else if (node.kind === ts.SyntaxKind.StringKeyword) {
      return new IdentifierNode('string');
    } else if (node.kind === ts.SyntaxKind.NumberKeyword) {
      return new IdentifierNode('number');
    } else if (node.kind === ts.SyntaxKind.BooleanKeyword) {
      return new IdentifierNode('boolean');
    } else if (node.kind === ts.SyntaxKind.NullKeyword) {
      return new IdentifierNode('null');
    } else if (node.kind === ts.SyntaxKind.UndefinedKeyword) {
      return new IdentifierNode('undefined');
    } else if (node.kind === ts.SyntaxKind.NeverKeyword) {
      return new IdentifierNode('never');
    } else if (node.kind === ts.SyntaxKind.AnyKeyword) {
      return new IdentifierNode('any');
    } else if (node.kind === ts.SyntaxKind.UnknownKeyword) {
      return new IdentifierNode('unknown');
    }

    // For any other complex types, fall back to raw expression
    const typeText = node.getText(this.sourceFile);
    return new RawExpressionNode(typeText);
  }
}

// Singleton instance for convenience
export const typeExpressionParser = new TypeExpressionParser();

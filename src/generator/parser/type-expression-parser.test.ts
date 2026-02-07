import { describe, expect, test } from 'vitest';
import { TypeExpressionParser } from './type-expression-parser';
import { GenericExpressionNode } from '../ast/generic-expression-node';
import { IdentifierNode } from '../ast/identifier-node';
import { UnionExpressionNode } from '../ast/union-expression-node';
import { LiteralNode } from '../ast/literal-node';
import { RawExpressionNode } from '../ast/raw-expression-node';

describe('TypeExpressionParser', () => {
  const parser = new TypeExpressionParser();

  describe('parse', () => {
    test('should parse simple identifiers', () => {
      const result = parser.parse('CustomType');
      expect(result).toBeInstanceOf(IdentifierNode);
      expect((result as IdentifierNode).name).toBe('CustomType');
    });

    test('should parse identifiers with underscores', () => {
      const result = parser.parse('MY_CUSTOM_TYPE');
      expect(result).toBeInstanceOf(IdentifierNode);
      expect((result as IdentifierNode).name).toBe('MY_CUSTOM_TYPE');
    });

    test('should parse generic types with single parameter', () => {
      const result = parser.parse('JSONColumnType<CustomType>');
      expect(result).toBeInstanceOf(GenericExpressionNode);
      const generic = result as GenericExpressionNode;
      expect(generic.name).toBe('JSONColumnType');
      expect(generic.args).toHaveLength(1);
      expect(generic.args[0]).toBeInstanceOf(IdentifierNode);
      expect((generic.args[0] as IdentifierNode).name).toBe('CustomType');
    });

    test('should parse generic types with multiple parameters', () => {
      const result = parser.parse('Map<string, CustomType>');
      expect(result).toBeInstanceOf(GenericExpressionNode);
      const generic = result as GenericExpressionNode;
      expect(generic.name).toBe('Map');
      expect(generic.args).toHaveLength(2);
      expect((generic.args[0] as IdentifierNode).name).toBe('string');
      expect((generic.args[1] as IdentifierNode).name).toBe('CustomType');
    });

    test('should parse nested generic types', () => {
      const result = parser.parse('Map<string, Array<CustomType>>');
      expect(result).toBeInstanceOf(GenericExpressionNode);
      const map = result as GenericExpressionNode;
      expect(map.name).toBe('Map');
      expect(map.args).toHaveLength(2);
      expect((map.args[0] as IdentifierNode).name).toBe('string');

      const array = map.args[1] as GenericExpressionNode;
      expect(array).toBeInstanceOf(GenericExpressionNode);
      expect(array.name).toBe('Array');
      expect(array.args).toHaveLength(1);
      expect((array.args[0] as IdentifierNode).name).toBe('CustomType');
    });

    test('should parse union types', () => {
      const result = parser.parse('TypeA | TypeB | TypeC');
      expect(result).toBeInstanceOf(UnionExpressionNode);
      const union = result as UnionExpressionNode;
      expect(union.args).toHaveLength(3);
      expect((union.args[0] as IdentifierNode).name).toBe('TypeA');
      expect((union.args[1] as IdentifierNode).name).toBe('TypeB');
      expect((union.args[2] as IdentifierNode).name).toBe('TypeC');
    });

    test('should parse string literal types', () => {
      const result = parser.parse('"active"');
      expect(result).toBeInstanceOf(LiteralNode);
      expect((result as LiteralNode).value).toBe('active');
    });

    test('should parse string literal unions', () => {
      const result = parser.parse('"active" | "inactive" | "pending"');
      expect(result).toBeInstanceOf(UnionExpressionNode);
      const union = result as UnionExpressionNode;
      expect(union.args).toHaveLength(3);
      expect((union.args[0] as LiteralNode).value).toBe('active');
      expect((union.args[1] as LiteralNode).value).toBe('inactive');
      expect((union.args[2] as LiteralNode).value).toBe('pending');
    });

    test('should parse number literal types', () => {
      const result = parser.parse('42');
      expect(result).toBeInstanceOf(LiteralNode);
      expect((result as LiteralNode).value).toBe(42);
    });

    test('should parse boolean literal types', () => {
      const trueResult = parser.parse('true');
      expect(trueResult).toBeInstanceOf(IdentifierNode);
      expect((trueResult as IdentifierNode).name).toBe('true');

      const falseResult = parser.parse('false');
      expect(falseResult).toBeInstanceOf(IdentifierNode);
      expect((falseResult as IdentifierNode).name).toBe('false');
    });

    test('should parse mixed literal unions', () => {
      const result = parser.parse('"auto" | 100 | true | null');
      expect(result).toBeInstanceOf(UnionExpressionNode);
      const union = result as UnionExpressionNode;
      expect(union.args).toHaveLength(4);
      expect((union.args[0] as LiteralNode).value).toBe('auto');
      expect((union.args[1] as LiteralNode).value).toBe(100);
      expect((union.args[2] as IdentifierNode).name).toBe('true');
      expect((union.args[3] as IdentifierNode).name).toBe('null');
    });

    test('should parse primitive types', () => {
      expect((parser.parse('string') as IdentifierNode).name).toBe('string');
      expect((parser.parse('number') as IdentifierNode).name).toBe('number');
      expect((parser.parse('boolean') as IdentifierNode).name).toBe('boolean');
      expect((parser.parse('null') as IdentifierNode).name).toBe('null');
      expect((parser.parse('undefined') as IdentifierNode).name).toBe(
        'undefined',
      );
      expect((parser.parse('never') as IdentifierNode).name).toBe('never');
      expect((parser.parse('any') as IdentifierNode).name).toBe('any');
      expect((parser.parse('unknown') as IdentifierNode).name).toBe('unknown');
    });

    test('should preserve array syntax as RawExpressionNode', () => {
      const result = parser.parse('CustomType[]');
      expect(result).toBeInstanceOf(RawExpressionNode);
      expect((result as RawExpressionNode).expression).toBe('CustomType[]');
    });

    test('should preserve multi-dimensional array syntax', () => {
      const result = parser.parse('CustomType[][]');
      expect(result).toBeInstanceOf(RawExpressionNode);
      expect((result as RawExpressionNode).expression).toBe('CustomType[][]');
    });

    test('should preserve intersection types as RawExpressionNode', () => {
      const result = parser.parse('TypeA & TypeB & TypeC');
      expect(result).toBeInstanceOf(RawExpressionNode);
      expect((result as RawExpressionNode).expression).toBe(
        'TypeA & TypeB & TypeC',
      );
    });

    test('should preserve object literal types as RawExpressionNode', () => {
      const result = parser.parse('{ tags: string[] }');
      expect(result).toBeInstanceOf(RawExpressionNode);
      expect((result as RawExpressionNode).expression).toBe(
        '{ tags: string[] }',
      );
    });

    test('should handle complex mixed expressions', () => {
      const result = parser.parse(
        'JSONColumnType<Partial<UserData> & { tags: string[] }>',
      );
      expect(result).toBeInstanceOf(GenericExpressionNode);
      const generic = result as GenericExpressionNode;
      expect(generic.name).toBe('JSONColumnType');
      expect(generic.args).toHaveLength(1);
      // The intersection type inside should be preserved as RawExpression
      expect(generic.args[0]).toBeInstanceOf(RawExpressionNode);
      expect((generic.args[0] as RawExpressionNode).expression).toBe(
        'Partial<UserData> & { tags: string[] }',
      );
    });

    test('should handle ColumnType with three parameters', () => {
      const result = parser.parse('ColumnType<string, string, never>');
      expect(result).toBeInstanceOf(GenericExpressionNode);
      const generic = result as GenericExpressionNode;
      expect(generic.name).toBe('ColumnType');
      expect(generic.args).toHaveLength(3);
      expect((generic.args[0] as IdentifierNode).name).toBe('string');
      expect((generic.args[1] as IdentifierNode).name).toBe('string');
      expect((generic.args[2] as IdentifierNode).name).toBe('never');
    });

    test('should handle empty string', () => {
      const result = parser.parse('');
      expect(result).toBeInstanceOf(RawExpressionNode);
      expect((result as RawExpressionNode).expression).toBe('');
    });
  });

  describe('extractTypeIdentifiers', () => {
    test('should extract identifiers from simple types', () => {
      const identifiers = parser.extractTypeIdentifiers('CustomType');
      expect(identifiers).toEqual(['CustomType']);
    });

    test('should extract identifiers from generic types', () => {
      const identifiers = parser.extractTypeIdentifiers(
        'JSONColumnType<CustomType>',
      );
      expect(identifiers).toContain('JSONColumnType');
      expect(identifiers).toContain('CustomType');
      expect(identifiers).toHaveLength(2);
    });

    test('should extract identifiers from nested generics', () => {
      const identifiers = parser.extractTypeIdentifiers(
        'Map<string, Array<Partial<User>>>',
      );
      expect(identifiers).toContain('Map');
      expect(identifiers).toContain('Array');
      expect(identifiers).toContain('Partial');
      expect(identifiers).toContain('User');
      expect(identifiers).not.toContain('string'); // Built-in types are included
    });

    test('should extract identifiers from union types', () => {
      const identifiers = parser.extractTypeIdentifiers(
        'TypeA | TypeB | TypeC | null',
      );
      expect(identifiers).toContain('TypeA');
      expect(identifiers).toContain('TypeB');
      expect(identifiers).toContain('TypeC');
      expect(identifiers).not.toContain('null'); // null is not collected as it's a keyword
    });

    test('should extract identifiers from intersection types', () => {
      const identifiers = parser.extractTypeIdentifiers(
        'BaseModel & Timestamped & Authored',
      );
      expect(identifiers).toContain('BaseModel');
      expect(identifiers).toContain('Timestamped');
      expect(identifiers).toContain('Authored');
    });

    test('should extract identifiers from array types', () => {
      const identifiers = parser.extractTypeIdentifiers('CustomType[]');
      expect(identifiers).toEqual(['CustomType']);
    });

    test('should extract identifiers from multi-dimensional arrays', () => {
      const identifiers = parser.extractTypeIdentifiers('NestedType[][]');
      expect(identifiers).toEqual(['NestedType']);
    });

    test('should handle complex mixed types', () => {
      const identifiers = parser.extractTypeIdentifiers(
        'JSONColumnType<Partial<UserData> & { tags: string[] }>',
      );
      expect(identifiers).toContain('JSONColumnType');
      expect(identifiers).toContain('Partial');
      expect(identifiers).toContain('UserData');
    });

    test('should not extract literal types', () => {
      const identifiers = parser.extractTypeIdentifiers(
        '"active" | "inactive" | 123 | true',
      );
      expect(identifiers).toEqual([]);
    });

    test('should handle types with underscores', () => {
      const identifiers = parser.extractTypeIdentifiers(
        'MY_CUSTOM_TYPE | Type_With_Underscores',
      );
      expect(identifiers).toContain('MY_CUSTOM_TYPE');
      expect(identifiers).toContain('Type_With_Underscores');
    });

    test('should handle ColumnType with parameters', () => {
      const identifiers = parser.extractTypeIdentifiers(
        'ColumnType<Permission[], string, Permission[] | null>',
      );
      expect(identifiers).toContain('ColumnType');
      expect(identifiers).toContain('Permission');
      expect(identifiers).toHaveLength(2); // ColumnType and Permission (deduplicated)
    });

    test('should handle empty string', () => {
      const identifiers = parser.extractTypeIdentifiers('');
      expect(identifiers).toEqual([]);
    });

    test('should handle conditional types', () => {
      const identifiers = parser.extractTypeIdentifiers(
        'T extends User ? Admin : Guest',
      );
      expect(identifiers).toContain('T');
      expect(identifiers).toContain('User');
      expect(identifiers).toContain('Admin');
      expect(identifiers).toContain('Guest');
    });

    test('should handle indexed access types', () => {
      const identifiers = parser.extractTypeIdentifiers('User["id"]');
      expect(identifiers).toContain('User');
    });

    test('should handle tuple types', () => {
      const identifiers = parser.extractTypeIdentifiers('[User, Admin, Guest]');
      expect(identifiers).toContain('User');
      expect(identifiers).toContain('Admin');
      expect(identifiers).toContain('Guest');
    });
  });
});

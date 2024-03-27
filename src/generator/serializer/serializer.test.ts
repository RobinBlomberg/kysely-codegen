import { strictEqual } from 'assert';
import { describe, it } from 'vitest';
import { EnumMap, factory } from '../../introspector/index.js';
import { AliasDeclarationNode } from '../ast/alias-declaration-node.js';
import { ArrayExpressionNode } from '../ast/array-expression-node.js';
import { ExportStatementNode } from '../ast/export-statement-node.js';
import { ExtendsClauseNode } from '../ast/extends-clause-node.js';
import { GenericExpressionNode } from '../ast/generic-expression-node.js';
import { IdentifierNode } from '../ast/identifier-node.js';
import { ImportClauseNode } from '../ast/import-clause-node.js';
import { ImportStatementNode } from '../ast/import-statement-node.js';
import { InferClauseNode } from '../ast/infer-clause-node.js';
import { InterfaceDeclarationNode } from '../ast/interface-declaration-node.js';
import { LiteralNode } from '../ast/literal-node.js';
import { MappedTypeNode } from '../ast/mapped-type-node.js';
import { ObjectExpressionNode } from '../ast/object-expression-node.js';
import { PropertyNode } from '../ast/property-node.js';
import { TemplateNode } from '../ast/template-node.js';
import { UnionExpressionNode } from '../ast/union-expression-node.js';
import { mysqlAdapter } from '../core/adapters/mysql.adapter.js';
import { postgresAdapter } from '../core/adapters/postgres.adapter.js';
import { RuntimeEnumDeclarationNode } from '../index.js';
import { transform } from '../transformer/transform.js';
import { Serializer } from './serializer.js';

describe('serializer', () => {
  const serializer = new Serializer();

  it('serializeAliasDeclaration', () => {
    strictEqual(
      serializer.serializeAliasDeclaration(
        new AliasDeclarationNode('MyType', new LiteralNode('foo')),
      ),
      'type MyType = "foo";',
    );
    strictEqual(
      serializer.serializeAliasDeclaration(
        new AliasDeclarationNode(
          'Union',
          new TemplateNode(
            ['A', 'B'],
            new UnionExpressionNode([
              new IdentifierNode('A'),
              new IdentifierNode('B'),
            ]),
          ),
        ),
      ),
      'type Union<A, B> = A | B;',
    );
  });

  it('serializeArrayExpression', () => {
    strictEqual(
      serializer.serializeArrayExpression(
        new ArrayExpressionNode(new IdentifierNode('Json')),
      ),
      'Json[]',
    );
  });

  it('serializeExportStatement', () => {
    strictEqual(
      serializer.serializeExportStatement(
        new ExportStatementNode(
          new AliasDeclarationNode('MyType', new LiteralNode('foo')),
        ),
      ),
      'export type MyType = "foo";',
    );
  });

  it('serializeExtendsClause', () => {
    strictEqual(
      serializer.serializeExtendsClause(
        new ExtendsClauseNode(
          new IdentifierNode('A'),
          new IdentifierNode('B'),
          new IdentifierNode('A'),
          new IdentifierNode('C'),
        ),
      ),
      'A extends B\n  ? A\n  : C',
    );
  });

  it('serializeGenericExpression', () => {
    strictEqual(
      serializer.serializeGenericExpression(
        new GenericExpressionNode('MyType', [
          new IdentifierNode('A'),
          new IdentifierNode('B'),
        ]),
      ),
      'MyType<A, B>',
    );
  });

  it('serializeIdentifier', () => {
    strictEqual(
      serializer.serializeIdentifier(new IdentifierNode('MyIdentifier')),
      'MyIdentifier',
    );
  });

  it('serializeImportClause', () => {
    strictEqual(
      serializer.serializeImportClause(new ImportClauseNode('ColumnType')),
      'ColumnType',
    );
    strictEqual(
      serializer.serializeImportClause(new ImportClauseNode('RawBuilder', 'R')),
      'RawBuilder as R',
    );
  });

  it('serializeImportStatement', () => {
    strictEqual(
      serializer.serializeImportStatement(
        new ImportStatementNode('kysely', [
          new ImportClauseNode('ColumnType'),
          new ImportClauseNode('RawBuilder', 'R'),
        ]),
      ),
      'import type { ColumnType, RawBuilder as R } from "kysely";',
    );
  });

  it('serializeInferClause', () => {
    strictEqual(
      serializer.serializeInferClause(new InferClauseNode('A')),
      'infer A',
    );
  });

  it('serializeInterfaceDeclaration', () => {
    strictEqual(
      serializer.serializeInterfaceDeclaration(
        new InterfaceDeclarationNode(
          'MyInterface',
          new ObjectExpressionNode([
            new PropertyNode('foo', new LiteralNode('bar')),
          ]),
        ),
      ),
      'interface MyInterface {\n  foo: "bar";\n}',
    );
  });

  it('serializeLiteral', () => {
    strictEqual(serializer.serializeLiteral(new LiteralNode('foo')), '"foo"');
  });

  it('serializeMappedType', () => {
    strictEqual(
      serializer.serializeMappedType(
        new MappedTypeNode(new IdentifierNode('Json')),
      ),
      '{\n  [K in string]?: Json;\n}',
    );
  });

  it('serializeObjectExpression', () => {
    strictEqual(
      serializer.serializeObjectExpression(new ObjectExpressionNode([])),
      '{}',
    );
    strictEqual(
      serializer.serializeObjectExpression(
        new ObjectExpressionNode([
          new PropertyNode('bar baz', new IdentifierNode('BarBaz')),
          new PropertyNode('foo', new IdentifierNode('Foo')),
        ]),
      ),
      '{\n  "bar baz": BarBaz;\n  foo: Foo;\n}',
    );
  });

  describe('serializeObjectExpression', () => {
    it('should order fields properly', () => {
      strictEqual(
        serializer.serializeObjectExpression(
          new ObjectExpressionNode([
            new PropertyNode('zip', new IdentifierNode('Num7')),
            new PropertyNode('avocado field', new IdentifierNode('Num3')),
            new PropertyNode('brachiosaurus', new IdentifierNode('Num4')),
            new PropertyNode('Zoo_field', new IdentifierNode('Num1')),
            new PropertyNode('jc_33', new IdentifierNode('Num5')),
            new PropertyNode('HelloField', new IdentifierNode('Num0')),
            new PropertyNode('typescript_LANG', new IdentifierNode('Num6')),
            new PropertyNode('_TEST', new IdentifierNode('Num2')),
          ]),
        ),
        '{\n' +
          '  _TEST: Num2;\n' +
          '  "avocado field": Num3;\n' +
          '  brachiosaurus: Num4;\n' +
          '  HelloField: Num0;\n' +
          '  jc_33: Num5;\n' +
          '  typescript_LANG: Num6;\n' +
          '  zip: Num7;\n' +
          '  Zoo_field: Num1;\n' +
          '}',
      );
    });
  });

  it('serializeProperty', () => {
    strictEqual(
      serializer.serializeProperty(
        new PropertyNode('foo', new IdentifierNode('Foo')),
      ),
      'foo: Foo;\n',
    );
    strictEqual(
      serializer.serializeProperty(
        new PropertyNode('bar baz', new IdentifierNode('BarBaz')),
      ),
      '"bar baz": BarBaz;\n',
    );
  });

  it('serializeUnionExpression', () => {
    strictEqual(
      serializer.serializeUnionExpression(
        new UnionExpressionNode([
          new IdentifierNode('JsonArray'),
          new IdentifierNode('JsonObject'),
          new IdentifierNode('JsonPrimitive'),
        ]),
      ),
      'JsonArray | JsonObject | JsonPrimitive',
    );
  });

  describe('serializeUnionExpression', () => {
    it('should order union constituents properly', () => {
      strictEqual(
        serializer.serializeUnionExpression(
          new UnionExpressionNode([
            new IdentifierNode('z_TYPE'),
            new IdentifierNode('undefined'),
            new IdentifierNode('Aa_Type'),
            new IdentifierNode('AA3Type'),
            new IdentifierNode('Z_TYPE'),
            new IdentifierNode('HType'),
            new IdentifierNode('null'),
            new IdentifierNode('AA_Type'),
            new IdentifierNode('Aa3Type'),
          ]),
        ),
        'AA3Type | AA_Type | Aa3Type | Aa_Type | HType | Z_TYPE | z_TYPE | null | undefined',
      );
    });
  });

  describe('serialize', () => {
    it('should serialize JSON fields properly', () => {
      const enums = new EnumMap();

      const ast = transform({
        adapter: mysqlAdapter,
        camelCase: true,
        schema: factory.createDatabaseSchema({
          enums,
          tables: [
            factory.createTableSchema({
              columns: [
                factory.createColumnSchema({
                  comment: 'Hello!\nThis is a comment.',
                  dataType: 'json',
                  name: 'json',
                }),
              ],
              name: 'foo',
              schema: 'public',
            }),
          ],
        }),
      });

      strictEqual(
        serializer.serialize(ast),
        'import type { ColumnType } from "kysely";\n' +
          '\n' +
          'export type Json = ColumnType<JsonValue, string, string>;\n' +
          '\n' +
          'export type JsonArray = JsonValue[];\n' +
          '\n' +
          'export type JsonObject = {\n' +
          '  [K in string]?: JsonValue;\n' +
          '};\n' +
          '\n' +
          'export type JsonPrimitive = boolean | number | string | null;\n' +
          '\n' +
          'export type JsonValue = JsonArray | JsonObject | JsonPrimitive;\n' +
          '\n' +
          'export interface Foo {\n' +
          '  /**\n' +
          '   * Hello!\n' +
          '   * This is a comment.\n' +
          '   */\n' +
          '  json: Json;\n' +
          '}\n' +
          '\n' +
          'export interface DB {\n' +
          '  foo: Foo;\n' +
          '}\n',
      );
    });

    it('should serialize Postgres JSON fields properly', () => {
      const enums = new EnumMap();

      const ast = transform({
        adapter: postgresAdapter,
        camelCase: true,
        schema: factory.createDatabaseSchema({
          enums,
          tables: [
            factory.createTableSchema({
              columns: [
                factory.createColumnSchema({ dataType: 'json', name: 'json' }),
              ],
              name: 'foo',
              schema: 'public',
            }),
          ],
        }),
      });

      strictEqual(
        serializer.serialize(ast),
        'export type Json = JsonValue;\n' +
          '\n' +
          'export type JsonArray = JsonValue[];\n' +
          '\n' +
          'export type JsonObject = {\n' +
          '  [K in string]?: JsonValue;\n' +
          '};\n' +
          '\n' +
          'export type JsonPrimitive = boolean | number | string | null;\n' +
          '\n' +
          'export type JsonValue = JsonArray | JsonObject | JsonPrimitive;\n' +
          '\n' +
          'export interface Foo {\n' +
          '  json: Json;\n' +
          '}\n' +
          '\n' +
          'export interface DB {\n' +
          '  foo: Foo;\n' +
          '}\n',
      );
    });

    it('should serialize runtime enums properly', () => {
      const enumSerializer = new Serializer({ camelCase: true });
      strictEqual(
        enumSerializer.serializeRuntimeEnum(
          new RuntimeEnumDeclarationNode(
            'Mood',
            new UnionExpressionNode([
              new LiteralNode('sad'),
              new LiteralNode('happy'),
              new LiteralNode('happy_or_sad'),
            ]),
          ),
        ),
        'enum Mood {\n' +
          '  happy = "happy",\n' +
          '  happyOrSad = "happy_or_sad",\n' +
          '  sad = "sad",\n' +
          '}',
      );
    });
  });
});

import { strictEqual } from 'assert';
import { MysqlDialect, PostgresDialect } from '../../dialects';
import { describe, it } from '../../test.utils';
import { AliasDeclarationNode } from '../ast/alias-declaration-node';
import { ArrayExpressionNode } from '../ast/array-expression-node';
import { ExportStatementNode } from '../ast/export-statement-node';
import { ExtendsClauseNode } from '../ast/extends-clause-node';
import { GenericExpressionNode } from '../ast/generic-expression-node';
import { IdentifierNode } from '../ast/identifier-node';
import { ImportClauseNode } from '../ast/import-clause-node';
import { ImportStatementNode } from '../ast/import-statement-node';
import { InferClauseNode } from '../ast/infer-clause-node';
import { InterfaceDeclarationNode } from '../ast/interface-declaration-node';
import { LiteralNode } from '../ast/literal-node';
import { MappedTypeNode } from '../ast/mapped-type-node';
import { ObjectExpressionNode } from '../ast/object-expression-node';
import { PropertyNode } from '../ast/property-node';
import { RuntimeEnumDeclarationNode } from '../ast/runtime-enum-declaration-node';
import { TemplateNode } from '../ast/template-node';
import { UnionExpressionNode } from '../ast/union-expression-node';
import { EnumCollection } from '../core/enum-collection';
import { ColumnMetadata } from '../core/metadata/column-metadata';
import { DatabaseMetadata } from '../core/metadata/database-metadata';
import { TableMetadata } from '../core/metadata/table-metadata';
import { Transformer } from '../transformer/transformer';
import { Serializer } from './serializer';

export const testSerializer = () => {
  void describe('serializer', () => {
    const serializer = new Serializer();

    void it('serializeAliasDeclaration', () => {
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

    void it('serializeArrayExpression', () => {
      strictEqual(
        serializer.serializeArrayExpression(
          new ArrayExpressionNode(new IdentifierNode('Json')),
        ),
        'Json[]',
      );
    });

    void it('serializeExportStatement', () => {
      strictEqual(
        serializer.serializeExportStatement(
          new ExportStatementNode(
            new AliasDeclarationNode('MyType', new LiteralNode('foo')),
          ),
        ),
        'export type MyType = "foo";',
      );
    });

    void it('serializeExtendsClause', () => {
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

    void it('serializeGenericExpression', () => {
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

    void it('serializeIdentifier', () => {
      strictEqual(
        serializer.serializeIdentifier(new IdentifierNode('MyIdentifier')),
        'MyIdentifier',
      );
    });

    void it('serializeImportClause', () => {
      strictEqual(
        serializer.serializeImportClause(new ImportClauseNode('ColumnType')),
        'ColumnType',
      );
      strictEqual(
        serializer.serializeImportClause(
          new ImportClauseNode('RawBuilder', 'R'),
        ),
        'RawBuilder as R',
      );
    });

    void it('serializeImportStatement', () => {
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

    void it('serializeInferClause', () => {
      strictEqual(
        serializer.serializeInferClause(new InferClauseNode('A')),
        'infer A',
      );
    });

    void it('serializeInterfaceDeclaration', () => {
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

    void it('serializeLiteral', () => {
      strictEqual(serializer.serializeLiteral(new LiteralNode('foo')), '"foo"');
    });

    void it('serializeMappedType', () => {
      strictEqual(
        serializer.serializeMappedType(
          new MappedTypeNode(new IdentifierNode('Json')),
        ),
        '{\n  [x: string]: Json | undefined;\n}',
      );
    });

    void it('serializeObjectExpression', () => {
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

    void describe('serializeObjectExpression', () => {
      void it('should order fields properly', () => {
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
          `{
  _TEST: Num2;
  "avocado field": Num3;
  brachiosaurus: Num4;
  HelloField: Num0;
  jc_33: Num5;
  typescript_LANG: Num6;
  zip: Num7;
  Zoo_field: Num1;
}`,
        );
      });
    });

    void it('serializeProperty', () => {
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

    void it('serializeUnionExpression', () => {
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

    void describe('serializeUnionExpression', () => {
      void it('should order union constituents properly', () => {
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

    void describe('serialize', () => {
      void it('should serialize JSON fields properly', () => {
        const dialect = new MysqlDialect();
        const enums = new EnumCollection();
        const transformer = new Transformer();

        const ast = transformer.transform({
          camelCase: true,
          dialect,
          metadata: new DatabaseMetadata(
            [
              new TableMetadata({
                columns: [
                  new ColumnMetadata({
                    comment: 'Hello!\nThis is a comment.',
                    dataType: 'json',
                    name: 'json',
                  }),
                ],
                name: 'foo',
                schema: 'public',
              }),
            ],
            enums,
          ),
        });

        strictEqual(
          serializer.serializeStatements(ast),
          'import type { ColumnType } from "kysely";\n' +
            '\n' +
            'export type Json = ColumnType<JsonValue, string, string>;\n' +
            '\n' +
            'export type JsonArray = JsonValue[];\n' +
            '\n' +
            'export type JsonObject = {\n' +
            '  [x: string]: JsonValue | undefined;\n' +
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
    });

    void describe('serialize', () => {
      void it('should serialize Postgres JSON fields properly', () => {
        const dialect = new PostgresDialect();
        const enums = new EnumCollection();
        const transformer = new Transformer();

        const ast = transformer.transform({
          camelCase: true,
          dialect,
          metadata: new DatabaseMetadata(
            [
              new TableMetadata({
                columns: [
                  new ColumnMetadata({ dataType: 'json', name: 'json' }),
                ],
                name: 'foo',
                schema: 'public',
              }),
            ],
            enums,
          ),
        });

        strictEqual(
          serializer.serializeStatements(ast),
          'export type Json = JsonValue;\n' +
            '\n' +
            'export type JsonArray = JsonValue[];\n' +
            '\n' +
            'export type JsonObject = {\n' +
            '  [x: string]: JsonValue | undefined;\n' +
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
    });

    void describe('serialize', () => {
      const enumSerializer = new Serializer({ camelCase: true });
      void it('should serialize runtime enums properly', () =>
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
        ));
    });

    void describe('serialize - convert plural to singular', () => {
      const dialect = new PostgresDialect();
      const enums = new EnumCollection();
      const transformer = new Transformer();
      const singularSerializer = new Serializer({ singular: true });

      const ast = transformer.transform({
        camelCase: true,
        dialect,
        metadata: new DatabaseMetadata(
          [
            new TableMetadata({
              columns: [
                new ColumnMetadata({
                  dataType: 'varchar',
                  name: 'username',
                  hasDefaultValue: true,
                }),
              ],
              name: 'users',
              schema: 'public',
            }),
          ],
          enums,
        ),
      });

      strictEqual(
        singularSerializer.serializeStatements(ast),
        'import type { ColumnType } from "kysely";\n' +
          '\n' +
          'export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>\n' +
          '  ? ColumnType<S, I | undefined, U>\n' +
          '  : ColumnType<T, T | undefined, T>;\n' +
          '\n' +
          'export interface User {\n' +
          '  username: Generated<string>;\n' +
          '}\n' +
          '\n' +
          'export interface DB {\n' +
          '  users: User;\n' +
          '}\n',
      );
    });
  });
};

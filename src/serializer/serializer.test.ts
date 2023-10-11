import { strictEqual } from 'assert';
import {
  AliasDeclarationNode,
  ArrayExpressionNode,
  ExportStatementNode,
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
  TemplateNode,
  UnionExpressionNode,
} from '../ast';
import {
  ColumnMetadata,
  DatabaseMetadata,
  EnumCollection,
  TableMetadata,
} from '../core';
import { MysqlDialect } from '../dialects';
import { describe, it } from '../test.utils';
import { Transformer } from '../transformer';
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
            'A',
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
        '{\n  [K in string]?: Json;\n}',
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
                    dataType: 'json',
                    hasDefaultValue: false,
                    isAutoIncrementing: false,
                    isNullable: false,
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
            '  json: Json;\n' +
            '}\n' +
            '\n' +
            'export interface DB {\n' +
            '  foo: Foo;\n' +
            '}\n',
        );
      });
    });
  });
};

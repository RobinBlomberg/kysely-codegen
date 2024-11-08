import { strictEqual } from 'assert';
import { EnumCollection } from '../../introspector/enum-collection';
import { ColumnMetadata } from '../../introspector/metadata/column-metadata';
import { DatabaseMetadata } from '../../introspector/metadata/database-metadata';
import { TableMetadata } from '../../introspector/metadata/table-metadata';
import { AliasDeclarationNode } from '../ast/alias-declaration-node';
import { ArrayExpressionNode } from '../ast/array-expression-node';
import { ExportStatementNode } from '../ast/export-statement-node';
import { ExtendsClauseNode } from '../ast/extends-clause-node';
import { GenericExpressionNode } from '../ast/generic-expression-node';
import {
  AliasIdentifierNode,
  DatabaseIdentifierNode,
  PrimitiveIdentifierNode,
  TableIdentifierNode,
} from '../ast/identifier-node';
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
import { MysqlDialect } from '../dialects/mysql/mysql-dialect';
import { PostgresDialect } from '../dialects/postgres/postgres-dialect';
import { transform } from '../transformer/transform';
import { RuntimeEnumsStyle } from './runtime-enums-style';
import { Serializer } from './serializer';

describe(Serializer.name, () => {
  const serializer = new Serializer();

  test(Serializer.prototype.serializeAliasDeclaration.name, () => {
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
              new AliasIdentifierNode('A'),
              new AliasIdentifierNode('B'),
            ]),
          ),
        ),
      ),
      'type Union<A, B> = A | B;',
    );
  });

  test(Serializer.prototype.serializeArrayExpression.name, () => {
    strictEqual(
      serializer.serializeArrayExpression(
        new ArrayExpressionNode(new AliasIdentifierNode('Json')),
      ),
      'Json[]',
    );
  });

  test(Serializer.prototype.serializeExportStatement.name, () => {
    strictEqual(
      serializer.serializeExportStatement(
        new ExportStatementNode(
          new AliasDeclarationNode('MyType', new LiteralNode('foo')),
        ),
      ),
      'export type MyType = "foo";',
    );
  });

  test(Serializer.prototype.serializeExtendsClause.name, () => {
    strictEqual(
      serializer.serializeExtendsClause(
        new ExtendsClauseNode(
          new AliasIdentifierNode('A'),
          new AliasIdentifierNode('B'),
          new AliasIdentifierNode('A'),
          new AliasIdentifierNode('C'),
        ),
      ),
      'A extends B\n  ? A\n  : C',
    );
  });

  test(Serializer.prototype.serializeGenericExpression.name, () => {
    strictEqual(
      serializer.serializeGenericExpression(
        new GenericExpressionNode('MyType', [
          new AliasIdentifierNode('A'),
          new AliasIdentifierNode('B'),
        ]),
      ),
      'MyType<A, B>',
    );
  });

  describe(Serializer.prototype.serializeIdentifier.name, () => {
    test('non-singularized', () => {
      strictEqual(
        serializer.serializeIdentifier(new DatabaseIdentifierNode('DB')),
        'DB',
      );
      strictEqual(
        serializer.serializeIdentifier(new AliasIdentifierNode('MyIdentifier')),
        'MyIdentifier',
      );
    });

    test('singularized table identifiers', () => {
      strictEqual(
        new Serializer({ singularize: true }).serializeIdentifier(
          new AliasIdentifierNode('Users'),
        ),
        'Users',
      );
      strictEqual(
        new Serializer({ singularize: true }).serializeIdentifier(
          new TableIdentifierNode('Users'),
        ),
        'User',
      );
      strictEqual(
        new Serializer({
          singularize: { '/^(.*?)s?$/': '$1_model' },
        }).serializeIdentifier(new TableIdentifierNode('Users')),
        'UserModel',
      );
    });
  });

  test(Serializer.prototype.serializeImportClause.name, () => {
    strictEqual(
      serializer.serializeImportClause(new ImportClauseNode('ColumnType')),
      'ColumnType',
    );
    strictEqual(
      serializer.serializeImportClause(new ImportClauseNode('RawBuilder', 'R')),
      'RawBuilder as R',
    );
  });

  test(Serializer.prototype.serializeImportStatement.name, () => {
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

  test(Serializer.prototype.serializeInferClause.name, () => {
    strictEqual(
      serializer.serializeInferClause(new InferClauseNode('A')),
      'infer A',
    );
  });

  test(Serializer.prototype.serializeInterfaceDeclaration.name, () => {
    strictEqual(
      serializer.serializeInterfaceDeclaration(
        new InterfaceDeclarationNode(
          new TableIdentifierNode('MyInterface'),
          new ObjectExpressionNode([
            new PropertyNode('foo', new LiteralNode('bar')),
          ]),
        ),
      ),
      'interface MyInterface {\n  foo: "bar";\n}',
    );
  });

  test(Serializer.prototype.serializeLiteral.name, () => {
    strictEqual(serializer.serializeLiteral(new LiteralNode('foo')), '"foo"');
  });

  test(Serializer.prototype.serializeMappedType.name, () => {
    strictEqual(
      serializer.serializeMappedType(
        new MappedTypeNode(new AliasIdentifierNode('Json')),
      ),
      '{\n  [x: string]: Json | undefined;\n}',
    );
  });

  test(Serializer.prototype.serializeObjectExpression.name, () => {
    strictEqual(
      serializer.serializeObjectExpression(new ObjectExpressionNode([])),
      '{}',
    );
    strictEqual(
      serializer.serializeObjectExpression(
        new ObjectExpressionNode([
          new PropertyNode('bar baz', new AliasIdentifierNode('BarBaz')),
          new PropertyNode('foo', new AliasIdentifierNode('Foo')),
        ]),
      ),
      '{\n  "bar baz": BarBaz;\n  foo: Foo;\n}',
    );
  });

  describe(Serializer.prototype.serializeObjectExpression.name, () => {
    it('should order fields properly', () => {
      strictEqual(
        serializer.serializeObjectExpression(
          new ObjectExpressionNode([
            new PropertyNode('zip', new AliasIdentifierNode('Num7')),
            new PropertyNode('avocado field', new AliasIdentifierNode('Num3')),
            new PropertyNode('brachiosaurus', new AliasIdentifierNode('Num4')),
            new PropertyNode('Zoo_field', new AliasIdentifierNode('Num1')),
            new PropertyNode('jc_33', new AliasIdentifierNode('Num5')),
            new PropertyNode('HelloField', new AliasIdentifierNode('Num0')),
            new PropertyNode(
              'typescript_LANG',
              new AliasIdentifierNode('Num6'),
            ),
            new PropertyNode('_TEST', new AliasIdentifierNode('Num2')),
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

  test(Serializer.prototype.serializeProperty.name, () => {
    strictEqual(
      serializer.serializeProperty(
        new PropertyNode('foo', new AliasIdentifierNode('Foo')),
      ),
      'foo: Foo;\n',
    );
    strictEqual(
      serializer.serializeProperty(
        new PropertyNode('bar baz', new AliasIdentifierNode('BarBaz')),
      ),
      '"bar baz": BarBaz;\n',
    );
  });

  describe(Serializer.prototype.serializeRuntimeEnum.name, () => {
    it('should serialize runtime enums properly in pascal case', () => {
      const enumSerializer = new Serializer({
        camelCase: true,
        runtimeEnums: RuntimeEnumsStyle.PASCAL_CASE,
      });

      strictEqual(
        enumSerializer.serializeRuntimeEnum(
          new RuntimeEnumDeclarationNode('Mood', [
            'sad',
            'happy',
            'happy_or_sad',
          ]),
        ),
        'enum Mood {\n' +
          '  Happy = "happy",\n' +
          '  HappyOrSad = "happy_or_sad",\n' +
          '  Sad = "sad",\n' +
          '}',
      );
    });

    it('should serialize runtime enums properly in screaming snake case', () => {
      const enumSerializer = new Serializer({ camelCase: true });

      strictEqual(
        enumSerializer.serializeRuntimeEnum(
          new RuntimeEnumDeclarationNode('Mood', [
            'sad',
            'happy',
            'happy_or_sad',
          ]),
        ),
        'enum Mood {\n' +
          '  HAPPY = "happy",\n' +
          '  HAPPY_OR_SAD = "happy_or_sad",\n' +
          '  SAD = "sad",\n' +
          '}',
      );
    });
  });

  describe(Serializer.prototype.serializeStatements.name, () => {
    it('should be able to singularize table names', () => {
      const dialect = new PostgresDialect();
      const enums = new EnumCollection();
      const singularSerializer = new Serializer({ singularize: true });

      const ast = transform({
        camelCase: true,
        dialect,
        metadata: new DatabaseMetadata({
          enums,
          tables: [
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
        }),
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

    it('should serialize JSON fields properly', () => {
      const dialect = new MysqlDialect();
      const enums = new EnumCollection();

      const ast = transform({
        camelCase: true,
        dialect,
        metadata: new DatabaseMetadata({
          enums,
          tables: [
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
        }),
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

    it('should serialize Postgres JSON fields properly', () => {
      const dialect = new PostgresDialect();
      const enums = new EnumCollection();

      const ast = transform({
        camelCase: true,
        dialect,
        metadata: new DatabaseMetadata({
          enums,
          tables: [
            new TableMetadata({
              columns: [new ColumnMetadata({ dataType: 'json', name: 'json' })],
              name: 'foo',
              schema: 'public',
            }),
          ],
        }),
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

  describe(Serializer.prototype.serializeUnionExpression.name, () => {
    it('should serialize union constituents properly with the correct ordering', () => {
      strictEqual(
        serializer.serializeUnionExpression(
          new UnionExpressionNode([
            new PrimitiveIdentifierNode('z_TYPE'),
            new PrimitiveIdentifierNode('undefined'),
            new AliasIdentifierNode('Aa_Type'),
            new AliasIdentifierNode('AA3Type'),
            new AliasIdentifierNode('Z_TYPE'),
            new AliasIdentifierNode('HType'),
            new PrimitiveIdentifierNode('null'),
            new AliasIdentifierNode('AA_Type'),
            new AliasIdentifierNode('Aa3Type'),
          ]),
        ),
        'AA3Type | AA_Type | Aa3Type | Aa_Type | HType | Z_TYPE | z_TYPE | null | undefined',
      );
    });
  });
});

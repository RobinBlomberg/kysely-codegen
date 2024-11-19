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
import { IdentifierNode, TableIdentifierNode } from '../ast/identifier-node';
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
import { transform } from '../transformer/transformer';
import { RuntimeEnumsStyle } from './runtime-enums-style';
import { TypeScriptSerializer } from './serializer';

describe(TypeScriptSerializer.name, () => {
  const serializer = new TypeScriptSerializer();

  test(TypeScriptSerializer.prototype.serializeAliasDeclaration.name, () => {
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

  test(TypeScriptSerializer.prototype.serializeArrayExpression.name, () => {
    strictEqual(
      serializer.serializeArrayExpression(
        new ArrayExpressionNode(new IdentifierNode('Json')),
      ),
      'Json[]',
    );
  });

  test(TypeScriptSerializer.prototype.serializeExportStatement.name, () => {
    strictEqual(
      serializer.serializeExportStatement(
        new ExportStatementNode(
          new AliasDeclarationNode('MyType', new LiteralNode('foo')),
        ),
      ),
      'export type MyType = "foo";',
    );
  });

  test(TypeScriptSerializer.prototype.serializeExtendsClause.name, () => {
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

  test(TypeScriptSerializer.prototype.serializeGenericExpression.name, () => {
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

  describe(TypeScriptSerializer.prototype.serializeIdentifier.name, () => {
    test('non-singularized', () => {
      strictEqual(
        serializer.serializeIdentifier(new IdentifierNode('DB')),
        'DB',
      );
      strictEqual(
        serializer.serializeIdentifier(new IdentifierNode('MyIdentifier')),
        'MyIdentifier',
      );
    });

    test('singularized table identifiers', () => {
      strictEqual(
        new TypeScriptSerializer({ singularize: true }).serializeIdentifier(
          new IdentifierNode('Users'),
        ),
        'Users',
      );
      strictEqual(
        new TypeScriptSerializer({ singularize: true }).serializeIdentifier(
          new TableIdentifierNode('Users'),
        ),
        'User',
      );
      strictEqual(
        new TypeScriptSerializer({
          singularize: { '/^(.*?)s?$/': '$1_model' },
        }).serializeIdentifier(new TableIdentifierNode('Users')),
        'UserModel',
      );
    });
  });

  test(TypeScriptSerializer.prototype.serializeImportClause.name, () => {
    strictEqual(
      serializer.serializeImportClause(new ImportClauseNode('ColumnType')),
      'ColumnType',
    );
    strictEqual(
      serializer.serializeImportClause(new ImportClauseNode('RawBuilder', 'R')),
      'RawBuilder as R',
    );
  });

  test(TypeScriptSerializer.prototype.serializeImportStatement.name, () => {
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

  test(TypeScriptSerializer.prototype.serializeInferClause.name, () => {
    strictEqual(
      serializer.serializeInferClause(new InferClauseNode('A')),
      'infer A',
    );
  });

  test(
    TypeScriptSerializer.prototype.serializeInterfaceDeclaration.name,
    () => {
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
    },
  );

  test(TypeScriptSerializer.prototype.serializeLiteral.name, () => {
    strictEqual(serializer.serializeLiteral(new LiteralNode('foo')), '"foo"');
  });

  test(TypeScriptSerializer.prototype.serializeMappedType.name, () => {
    strictEqual(
      serializer.serializeMappedType(
        new MappedTypeNode(new IdentifierNode('Json')),
      ),
      '{\n  [x: string]: Json | undefined;\n}',
    );
  });

  test(TypeScriptSerializer.prototype.serializeObjectExpression.name, () => {
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

  describe(
    TypeScriptSerializer.prototype.serializeObjectExpression.name,
    () => {
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
    },
  );

  test(TypeScriptSerializer.prototype.serializeProperty.name, () => {
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

  describe(TypeScriptSerializer.prototype.serializeRuntimeEnum.name, () => {
    it('should serialize runtime enums properly in pascal case', () => {
      const enumSerializer = new TypeScriptSerializer({
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
      const enumSerializer = new TypeScriptSerializer();

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

  describe(TypeScriptSerializer.prototype.serializeStatements.name, () => {
    it('should be able to singularize table names', () => {
      const dialect = new PostgresDialect();
      const enums = new EnumCollection();
      const singularSerializer = new TypeScriptSerializer({
        singularize: true,
      });

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

  describe(TypeScriptSerializer.prototype.serializeUnionExpression.name, () => {
    it('should serialize union constituents properly with the correct ordering', () => {
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
});

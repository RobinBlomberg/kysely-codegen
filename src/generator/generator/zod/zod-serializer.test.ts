import { strictEqual } from 'assert';
import { describe, it, test } from 'vitest';
import { EnumCollection } from '../../../introspector/enum-collection';
import { ColumnMetadata } from '../../../introspector/metadata/column-metadata';
import { DatabaseMetadata } from '../../../introspector/metadata/database-metadata';
import { TableMetadata } from '../../../introspector/metadata/table-metadata';
import { AliasDeclarationNode } from '../../ast/alias-declaration-node';
import { ArrayExpressionNode } from '../../ast/array-expression-node';
import { ExportStatementNode } from '../../ast/export-statement-node';
import { IdentifierNode } from '../../ast/identifier-node';
import { ImportClauseNode } from '../../ast/import-clause-node';
import { ImportStatementNode } from '../../ast/import-statement-node';
import { InterfaceDeclarationNode } from '../../ast/interface-declaration-node';
import { LiteralNode } from '../../ast/literal-node';
import { ObjectExpressionNode } from '../../ast/object-expression-node';
import { PropertyNode } from '../../ast/property-node';
import { RuntimeEnumDeclarationNode } from '../../ast/runtime-enum-declaration-node';
import { UnionExpressionNode } from '../../ast/union-expression-node';
import { PostgresZodDialect } from '../../dialects/zod-dialects/postgres-zod/postgres-zod-dialect';
import { zodTransform } from '../../transformer/zod/zod-transform';
import { RuntimeEnumsStyle } from '../runtime-enums-style';
import { ZodSerializer } from './zod-serializer';

describe(ZodSerializer.name, () => {
  const zodSerializer = new ZodSerializer();

  test(ZodSerializer.prototype.serializeAliasDeclaration.name, () => {
    strictEqual(
      zodSerializer.serializeAliasDeclaration(
        new AliasDeclarationNode('MyType', new IdentifierNode('z.number()')),
      ),
      'const MyType = z.number();',
    );
    strictEqual(
      zodSerializer.serializeAliasDeclaration(
        new AliasDeclarationNode(
          'Union',
          new UnionExpressionNode([
            new IdentifierNode('A'),
            new IdentifierNode('B'),
          ]),
        ),
      ),
      'const Union = z.union([A, B]);',
    );
  });

  test(ZodSerializer.prototype.serializeArrayExpression.name, () => {
    strictEqual(
      zodSerializer.serializeArrayExpression(
        new ArrayExpressionNode(new IdentifierNode('json')),
      ),
      'json.array()',
    );
  });

  test(ZodSerializer.prototype.serializeExportStatement.name, () => {
    strictEqual(
      zodSerializer.serializeExportStatement(
        new ExportStatementNode(
          new AliasDeclarationNode('MyType', new IdentifierNode('z.string()')),
        ),
      ),
      'export const MyType = z.string();',
    );
  });

  test(ZodSerializer.prototype.serializeIdentifier.name, () => {
    strictEqual(
      zodSerializer.serializeIdentifier(new IdentifierNode('MyIdentifier')),
      'MyIdentifier',
    );
  });

  test(ZodSerializer.prototype.serializeImportStatement.name, () => {
    strictEqual(
      zodSerializer.serializeImportStatement(
        new ImportStatementNode('zod', [new ImportClauseNode('z')]),
      ),
      'import { z } from "zod";',
    );
  });

  test(ZodSerializer.prototype.serializeInterfaceDeclaration.name, () => {
    strictEqual(
      zodSerializer.serializeInterfaceDeclaration(
        new InterfaceDeclarationNode(
          'MyInterface',
          new ObjectExpressionNode([
            new PropertyNode('foo', new LiteralNode('bar')),
          ]),
        ),
      ),
      'const MyInterface = z.object({\n  foo: z.literal("bar"),\n})',
    );
  });

  test(ZodSerializer.prototype.serializeLiteral.name, () => {
    strictEqual(
      zodSerializer.serializeLiteral(new LiteralNode('foo')),
      'z.literal("foo")',
    );
  });

  test(ZodSerializer.prototype.serializeObjectExpression.name, () => {
    strictEqual(
      zodSerializer.serializeObjectExpression(new ObjectExpressionNode([])),
      'z.object({})',
    );
    strictEqual(
      zodSerializer.serializeObjectExpression(
        new ObjectExpressionNode([
          new PropertyNode('bar baz', new IdentifierNode('BarBaz')),
          new PropertyNode('foo', new IdentifierNode('Foo')),
        ]),
      ),
      'z.object({\n  "bar baz": BarBaz,\n  foo: Foo,\n})',
    );
  });

  describe(ZodSerializer.prototype.serializeObjectExpression.name, () => {
    it('should order fields properly', () => {
      strictEqual(
        zodSerializer.serializeObjectExpression(
          new ObjectExpressionNode([
            new PropertyNode('zip', new IdentifierNode('someSchema7')),
            new PropertyNode(
              'avocado field',
              new IdentifierNode('someSchema3'),
            ),
            new PropertyNode(
              'brachiosaurus',
              new IdentifierNode('someSchema4'),
            ),
            new PropertyNode('Zoo_field', new IdentifierNode('someSchema1')),
            new PropertyNode('jc_33', new IdentifierNode('someSchema5')),
            new PropertyNode('HelloField', new IdentifierNode('someSchema0')),
            new PropertyNode(
              'typescript_LANG',
              new IdentifierNode('someSchema6'),
            ),
            new PropertyNode('_TEST', new IdentifierNode('someSchema2')),
          ]),
        ),
        `z.object({
  _TEST: someSchema2,
  "avocado field": someSchema3,
  brachiosaurus: someSchema4,
  HelloField: someSchema0,
  jc_33: someSchema5,
  typescript_LANG: someSchema6,
  zip: someSchema7,
  Zoo_field: someSchema1,
})`,
      );
    });
  });

  test(ZodSerializer.prototype.serializeProperty.name, () => {
    strictEqual(
      zodSerializer.serializeProperty(
        new PropertyNode('foo', new IdentifierNode('Foo')),
      ),
      'foo: Foo,\n',
    );
    strictEqual(
      zodSerializer.serializeProperty(
        new PropertyNode('bar baz', new IdentifierNode('BarBaz')),
      ),
      '"bar baz": BarBaz,\n',
    );
  });

  describe(ZodSerializer.prototype.serializeRuntimeEnum.name, () => {
    it('should serialize runtime enums properly in pascal case', () => {
      const enumSerializer = new ZodSerializer({
        camelCase: true,
        runtimeEnumsStyle: RuntimeEnumsStyle.PASCAL_CASE,
      });

      strictEqual(
        enumSerializer.serializeRuntimeEnum(
          new RuntimeEnumDeclarationNode('Mood', [
            'sad',
            'happy',
            'happy_or_sad',
          ]),
        ),
        'const Mood = z.object({\n  Happy: z.literal("happy"),\n  HappyOrSad: z.literal("happy_or_sad"),\n  Sad: z.literal("sad"),\n})',
      );
    });
  });

  describe(ZodSerializer.prototype.serializeStatements.name, () => {
    it('should be able to singularize table names', () => {
      const dialect = new PostgresZodDialect();
      const enums = new EnumCollection();
      const singularSerializer = new ZodSerializer({ singular: true });

      const ast = zodTransform({
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
        'import { z } from "zod";\n' +
          '\n' +
          'export const userTableSchema = z.object({\n' +
          '  username: z.string(),\n' +
          '})\n' +
          '\n' +
          'export const DBSchema = z.object({\n' +
          '  users: userTableSchema,\n' +
          '})\n',
      );
    });

    it('should serialize Postgres JSON fields properly', () => {
      const dialect = new PostgresZodDialect();
      const enums = new EnumCollection();

      const ast = zodTransform({
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
        zodSerializer.serializeStatements(ast),
        'import { z } from "zod";\n' +
          '\n' +
          'export const jsonSchema = z.object({}).catchall(z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.any())]));\n' +
          '\n' +
          'export const fooTableSchema = z.object({\n' +
          '  json: jsonSchema,\n' +
          '})\n' +
          '\n' +
          'export const DBSchema = z.object({\n' +
          '  foo: fooTableSchema,\n' +
          '})\n',
      );
    });
  });

  describe(ZodSerializer.prototype.serializeUnionExpression.name, () => {
    it('should serialize union constituents properly with the correct ordering', () => {
      strictEqual(
        zodSerializer.serializeUnionExpression(
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
        'z.union([AA3Type, AA_Type, Aa3Type, Aa_Type, HType, Z_TYPE, z_TYPE, null, undefined])',
      );
    });
  });
});

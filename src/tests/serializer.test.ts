import { strictEqual } from 'assert';
import { MysqlDialect } from '../dialects';
import { EnumCollection } from '../enum-collection';
import { ColumnMetadata, DatabaseMetadata, TableMetadata } from '../metadata';
import {
  ArrayExpressionNode,
  IdentifierNode,
  UnionExpressionNode,
} from '../nodes';
import { MappedTypeNode } from '../nodes/mapped-type-node';
import { Serializer } from '../serializer';
import { Transformer } from '../transformer';
import { describe, it } from './test.utils';

void describe('serializer', () => {
  const serializer = new Serializer();

  void it('serializeArrayExpression', () => {
    strictEqual(
      serializer.serializeArrayExpression(
        new ArrayExpressionNode(new IdentifierNode('Json')),
      ),
      'Json[]',
    );
  });

  void it('serializeGenericExpression', () => {
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

  void it('serializeMappedType', () => {
    strictEqual(
      serializer.serializeMappedType(
        new MappedTypeNode(new IdentifierNode('Json')),
      ),
      '{\n  [K in string]?: Json;\n}',
    );
  });

  void describe('serialize', () => {
    void it('should serialize JSON fields properly', () => {
      const dialect = new MysqlDialect();
      const enums = new EnumCollection();
      const transformer = new Transformer(dialect, true, enums);

      const ast = transformer.transform(
        new DatabaseMetadata(
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
      );

      strictEqual(
        serializer.serialize(ast),
        "import { ColumnType } from 'kysely';\n" +
          '\n' +
          'export type Json = ColumnType<JsonValue, string, string>;\n' +
          '\n' +
          'export type JsonArray = JsonValue[];\n' +
          '\n' +
          'export type JsonObject = {\n' +
          '  [K in string]?: JsonValue;\n' +
          '};\n' +
          '\n' +
          'export type JsonPrimitive = boolean | null | number | string;\n' +
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

import { strictEqual } from 'assert';
import { MysqlDialect } from '../dialects';
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
      const transformer = new Transformer(dialect, true);

      const ast = transformer.transform([
        {
          columns: [
            {
              dataType: 'json',
              hasDefaultValue: false,
              isAutoIncrementing: false,
              isNullable: false,
              name: 'json',
            },
          ],
          name: 'foo',
          schema: 'public',
        },
      ]);

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

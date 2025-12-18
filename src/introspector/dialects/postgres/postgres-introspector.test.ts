import { describe, expect, test } from 'vitest';
import { PostgresIntrospector } from './postgres-introspector';

type RawColumn = {
  auto_incrementing: string | null;
  column: string;
  column_description: string | null;
  has_default: boolean;
  not_null: boolean;
  schema: string;
  table: string;
  table_type: string;
  type: string;
  type_schema: string;
};

const parseTableMetadata = (introspector: PostgresIntrospector) => {
  return (
    introspector as unknown as {
      parseTableMetadata: (columns: RawColumn[]) => unknown[];
    }
  ).parseTableMetadata.bind(introspector);
};

const column = ({
  schema,
  table,
  ...overrides
}: Partial<RawColumn> & Pick<RawColumn, 'schema' | 'table'>): RawColumn => ({
  auto_incrementing: null,
  column: 'id',
  column_description: null,
  has_default: false,
  not_null: true,
  schema,
  table,
  table_type: 'r',
  type: 'int4',
  type_schema: 'pg_catalog',
  ...overrides,
});

describe(PostgresIntrospector.name, () => {
  test('marks materialized views as views', () => {
    const introspector = new PostgresIntrospector();
    const tables = parseTableMetadata(introspector)([
      column({ schema: 'public', table: 'foo_bar_mv', table_type: 'm' }),
    ]);

    expect(tables).toHaveLength(1);
    expect(tables[0]).toMatchObject({
      isView: true,
      name: 'foo_bar_mv',
      schema: 'public',
    });
    expect((tables[0] as any).columns).toHaveLength(1);
    expect((tables[0] as any).columns[0]).toMatchObject({
      comment: undefined,
      dataType: 'int4',
      dataTypeSchema: 'pg_catalog',
      hasDefaultValue: false,
      isAutoIncrementing: false,
      isNullable: false,
      name: 'id',
    });
  });

  test('groups columns by schema and table without collisions', () => {
    const introspector = new PostgresIntrospector();
    const tables = parseTableMetadata(introspector)([
      column({ schema: 'a.b', table: 'c', table_type: 'm' }),
      column({ schema: 'a', table: 'b.c', table_type: 'm' }),
    ]);

    expect(tables).toHaveLength(2);
    expect(tables).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'c', schema: 'a.b' }),
        expect.objectContaining({ name: 'b.c', schema: 'a' }),
      ]),
    );
  });

  test('collects multiple columns for the same table', () => {
    const introspector = new PostgresIntrospector();
    const tables = parseTableMetadata(introspector)([
      column({ schema: 'public', table: 't', column: 'a' }),
      column({ schema: 'public', table: 't', column: 'b', not_null: false }),
    ]);

    expect(tables).toHaveLength(1);
    expect((tables[0] as any).columns).toHaveLength(2);
    expect((tables[0] as any).columns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'a', isNullable: false }),
        expect.objectContaining({ name: 'b', isNullable: true }),
      ]),
    );
  });
});

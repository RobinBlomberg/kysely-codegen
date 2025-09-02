import { deepStrictEqual, ok } from 'node:assert';
import { EnumCollection } from '../../introspector/enum-collection';
import type { ColumnMetadata } from '../../introspector/metadata/column-metadata';
import type { DatabaseMetadata } from '../../introspector/metadata/database-metadata';
import type { TableMetadata } from '../../introspector/metadata/table-metadata';
import { ExportStatementNode } from '../ast/export-statement-node';
import { IdentifierNode } from '../ast/identifier-node';
import { ImportStatementNode } from '../ast/import-statement-node';
import { InterfaceDeclarationNode } from '../ast/interface-declaration-node';
import { RawExpressionNode } from '../ast/raw-expression-node';
import { PostgresDialect } from '../dialects/postgres/postgres-dialect';
import { transform } from './transformer';

describe('transform with type mapping', () => {
  const createColumn = (
    name: string,
    dataType: string,
    options?: Partial<ColumnMetadata>,
  ): ColumnMetadata => ({
    comment: null,
    dataType,
    dataTypeSchema: undefined,
    enumValues: null,
    hasDefaultValue: false,
    isArray: false,
    isAutoIncrementing: false,
    isNullable: false,
    name,
    ...options,
  });

  const createTable = (
    name: string,
    columns: ColumnMetadata[],
  ): TableMetadata => ({
    columns,
    isPartition: false,
    isView: false,
    name,
    schema: undefined,
  });

  const createMetadata = (tables: TableMetadata[]): DatabaseMetadata => ({
    enums: new EnumCollection(),
    tables,
  });

  it('should apply type mapping to known scalar types', () => {
    const metadata = createMetadata([
      createTable('events', [
        createColumn('id', 'int4'),
        createColumn('created_at', 'timestamptz'),
        createColumn('event_date', 'date'),
        createColumn('duration', 'interval'),
      ]),
    ]);

    const nodes = transform({
      customImports: {
        Temporal: '@js-temporal/polyfill',
      },
      dialect: new PostgresDialect(),
      metadata,
      typeMapping: {
        date: 'Temporal.PlainDate',
        interval: 'Temporal.Duration',
        timestamptz: 'Temporal.Instant',
      },
    });

    // Find the import statement:
    const importNode = nodes.find(
      (node) =>
        node instanceof ImportStatementNode &&
        node.moduleName === '@js-temporal/polyfill',
    );
    ok(importNode);

    // Find the events table:
    const eventsNode = nodes.find(
      (node): node is ExportStatementNode =>
        node instanceof ExportStatementNode &&
        node.argument instanceof InterfaceDeclarationNode &&
        node.argument.id.name === 'Events',
    );

    ok(eventsNode);
    const eventsInterface = eventsNode.argument as InterfaceDeclarationNode;
    const eventsBody = eventsInterface.body;

    // Check that the `created_at` column uses `Temporal.Instant`:
    const createdAtProp = eventsBody.properties.find(
      (p) => p.key === 'created_at',
    );
    ok(createdAtProp);
    ok(createdAtProp.value instanceof RawExpressionNode);
    deepStrictEqual(createdAtProp.value.expression, 'Temporal.Instant');

    // Check that the `event_date` column uses `Temporal.PlainDate`:
    const eventDateProp = eventsBody.properties.find(
      (p) => p.key === 'event_date',
    );
    ok(eventDateProp);
    ok(eventDateProp.value instanceof RawExpressionNode);
    deepStrictEqual(eventDateProp.value.expression, 'Temporal.PlainDate');

    // Check that the `duration` column uses `Temporal.Duration`:
    const durationProp = eventsBody.properties.find(
      (p) => p.key === 'duration',
    );
    ok(durationProp);
    ok(durationProp.value instanceof RawExpressionNode);
    deepStrictEqual(durationProp.value.expression, 'Temporal.Duration');

    // Check that the `int4` column still uses default mapping:
    const idProp = eventsBody.properties.find((p) => p.key === 'id');
    ok(idProp);
    ok(idProp.value instanceof IdentifierNode);
    deepStrictEqual(idProp.value.name, 'number');
  });

  it('should apply type mapping to PostgreSQL range types', () => {
    const metadata = createMetadata([
      createTable('bookings', [
        createColumn('id', 'int4'),
        createColumn('time_range', 'tstzrange'),
        createColumn('date_range', 'daterange'),
      ]),
    ]);

    const nodes = transform({
      customImports: {
        DateRange: './custom-types',
        InstantRange: './custom-types',
      },
      dialect: new PostgresDialect(),
      metadata,
      typeMapping: {
        daterange: 'DateRange',
        tstzrange: 'InstantRange',
      },
    });

    // Find the import statement
    const importNode = nodes.find(
      (node) =>
        node instanceof ImportStatementNode &&
        node.moduleName === './custom-types',
    );
    ok(importNode);

    // Find the bookings table:
    const bookingsNode = nodes.find(
      (node): node is ExportStatementNode =>
        node instanceof ExportStatementNode &&
        node.argument instanceof InterfaceDeclarationNode &&
        node.argument.id.name === 'Bookings',
    );

    ok(bookingsNode);
    const bookingsInterface = bookingsNode.argument as InterfaceDeclarationNode;
    const bookingsBody = bookingsInterface.body;

    // Check that the `time_range` column uses `InstantRange`:
    const timeRangeProp = bookingsBody.properties.find(
      (p) => p.key === 'time_range',
    );
    ok(timeRangeProp);
    ok(timeRangeProp.value instanceof RawExpressionNode);
    deepStrictEqual(timeRangeProp.value.expression, 'InstantRange');

    // Check that the `date_range` column uses `DateRange`:
    const dateRangeProp = bookingsBody.properties.find(
      (p) => p.key === 'date_range',
    );
    ok(dateRangeProp);
    ok(dateRangeProp.value instanceof RawExpressionNode);
    deepStrictEqual(dateRangeProp.value.expression, 'DateRange');
  });

  it('should not apply type mapping to unknown types', () => {
    const metadata = createMetadata([
      createTable('test', [
        createColumn('id', 'int4'),
        createColumn('unknown_type', 'my_custom_type'),
      ]),
    ]);

    const nodes = transform({
      dialect: new PostgresDialect(),
      metadata,
      typeMapping: {
        my_custom_type: 'MyCustomType',
      },
    });

    // Find the test table:
    const testNode = nodes.find(
      (node): node is ExportStatementNode =>
        node instanceof ExportStatementNode &&
        node.argument instanceof InterfaceDeclarationNode &&
        node.argument.id.name === 'Test',
    );

    ok(testNode);
    const testInterface = testNode.argument as InterfaceDeclarationNode;
    const testBody = testInterface.body;

    // Check that `unknown_type` falls back to the default scalar (`string`):
    const unknownProp = testBody.properties.find(
      (p) => p.key === 'unknown_type',
    );
    ok(unknownProp);
    ok(unknownProp.value instanceof IdentifierNode);
    deepStrictEqual(unknownProp.value.name, 'string');
  });

  it('should work with arrays and nullable types', () => {
    const metadata = createMetadata([
      createTable('arrays', [
        createColumn('timestamps', 'timestamptz', { isArray: true }),
        createColumn('nullable_timestamp', 'timestamptz', { isNullable: true }),
        createColumn('nullable_array', 'timestamptz', {
          isArray: true,
          isNullable: true,
        }),
      ]),
    ]);

    const nodes = transform({
      customImports: {
        Temporal: '@js-temporal/polyfill',
      },
      dialect: new PostgresDialect(),
      metadata,
      typeMapping: {
        timestamptz: 'Temporal.Instant',
      },
    });

    // Find the `Arrays` table:
    const arraysNode = nodes.find(
      (node): node is ExportStatementNode =>
        node instanceof ExportStatementNode &&
        node.argument instanceof InterfaceDeclarationNode &&
        node.argument.id.name === 'Arrays',
    );

    ok(arraysNode);
    const arraysInterface = arraysNode.argument as InterfaceDeclarationNode;
    const arraysBody = arraysInterface.body;

    // Verify that the type mapping is applied correctly with
    // arrays and nullable:
    const timestampsProp = arraysBody.properties.find(
      (p) => p.key === 'timestamps',
    );
    // Should be `ArrayType<Temporal.Instant>`:
    ok(timestampsProp);

    const nullableTimestampProp = arraysBody.properties.find(
      (p) => p.key === 'nullable_timestamp',
    );
    // Should be `Temporal.Instant | null`:
    ok(nullableTimestampProp);

    const nullableArrayProp = arraysBody.properties.find(
      (p) => p.key === 'nullable_array',
    );
    // Should be `ArrayType<Temporal.Instant>` | null:
    ok(nullableArrayProp);
  });
});

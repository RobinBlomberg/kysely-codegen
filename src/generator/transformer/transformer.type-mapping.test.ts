import { deepStrictEqual, ok } from 'node:assert';
import { AliasDeclarationNode } from '../ast/alias-declaration-node';
import { ExportStatementNode } from '../ast/export-statement-node';
import { IdentifierNode } from '../ast/identifier-node';
import { ImportStatementNode } from '../ast/import-statement-node';
import { InterfaceDeclarationNode } from '../ast/interface-declaration-node';
import { ObjectExpressionNode } from '../ast/object-expression-node';
import { PropertyNode } from '../ast/property-node';
import { RawExpressionNode } from '../ast/raw-expression-node';
import { RuntimeEnumDeclarationNode } from '../ast/runtime-enum-declaration-node';
import { PostgresDialect } from '../dialects/postgres/postgres-dialect';
import { transform } from './transformer';
import type { ColumnMetadata } from '../../introspector/metadata/column-metadata';
import type { DatabaseMetadata } from '../../introspector/metadata/database-metadata';
import type { TableMetadata } from '../../introspector/metadata/table-metadata';
import { EnumCollection } from '../../introspector/enum-collection';

describe('transform with type mapping', () => {
  const createColumn = (name: string, dataType: string, options?: Partial<ColumnMetadata>): ColumnMetadata => ({
    dataType,
    name,
    isArray: false,
    isNullable: false,
    isAutoIncrementing: false,
    hasDefaultValue: false,
    comment: null,
    ...options,
  });

  const createTable = (name: string, columns: ColumnMetadata[]): TableMetadata => ({
    name,
    schema: null,
    columns,
  });

  const createMetadata = (tables: TableMetadata[]): DatabaseMetadata => ({
    tables,
    enums: new EnumCollection(),
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
      dialect: new PostgresDialect(),
      metadata,
      typeMapping: {
        timestamptz: 'Temporal.Instant',
        date: 'Temporal.PlainDate',
        interval: 'Temporal.Duration',
      },
      customImports: {
        Temporal: '@js-temporal/polyfill',
      },
    });

    // Find the import statement
    const importNode = nodes.find(
      (node) => node instanceof ImportStatementNode && node.moduleName === '@js-temporal/polyfill'
    );
    ok(importNode);

    // Find the events table
    const eventsNode = nodes.find(
      (node) =>
        node instanceof ExportStatementNode &&
        node.argument instanceof InterfaceDeclarationNode &&
        node.argument.id.name === 'Events'
    ) as ExportStatementNode;
    
    ok(eventsNode);
    const eventsInterface = eventsNode.argument as InterfaceDeclarationNode;
    const eventsBody = eventsInterface.body as ObjectExpressionNode;
    
    // Check the created_at column uses Temporal.Instant
    const createdAtProp = eventsBody.properties.find(p => p.key === 'created_at') as PropertyNode;
    ok(createdAtProp);
    ok(createdAtProp.value instanceof RawExpressionNode);
    deepStrictEqual(createdAtProp.value.expression, 'Temporal.Instant');

    // Check the event_date column uses Temporal.PlainDate
    const eventDateProp = eventsBody.properties.find(p => p.key === 'event_date') as PropertyNode;
    ok(eventDateProp);
    ok(eventDateProp.value instanceof RawExpressionNode);
    deepStrictEqual(eventDateProp.value.expression, 'Temporal.PlainDate');

    // Check the duration column uses Temporal.Duration
    const durationProp = eventsBody.properties.find(p => p.key === 'duration') as PropertyNode;
    ok(durationProp);
    ok(durationProp.value instanceof RawExpressionNode);
    deepStrictEqual(durationProp.value.expression, 'Temporal.Duration');

    // Check that int4 still uses default mapping
    const idProp = eventsBody.properties.find(p => p.key === 'id') as PropertyNode;
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
      dialect: new PostgresDialect(),
      metadata,
      typeMapping: {
        tstzrange: 'InstantRange',
        daterange: 'DateRange',
      },
      customImports: {
        InstantRange: './custom-types',
        DateRange: './custom-types',
      },
    });

    // Find the import statement
    const importNode = nodes.find(
      (node) => node instanceof ImportStatementNode && node.moduleName === './custom-types'
    );
    ok(importNode);

    // Find the bookings table
    const bookingsNode = nodes.find(
      (node) =>
        node instanceof ExportStatementNode &&
        node.argument instanceof InterfaceDeclarationNode &&
        node.argument.id.name === 'Bookings'
    ) as ExportStatementNode;
    
    ok(bookingsNode);
    const bookingsInterface = bookingsNode.argument as InterfaceDeclarationNode;
    const bookingsBody = bookingsInterface.body as ObjectExpressionNode;
    
    // Check the time_range column uses InstantRange
    const timeRangeProp = bookingsBody.properties.find(p => p.key === 'time_range') as PropertyNode;
    ok(timeRangeProp);
    ok(timeRangeProp.value instanceof RawExpressionNode);
    deepStrictEqual(timeRangeProp.value.expression, 'InstantRange');

    // Check the date_range column uses DateRange
    const dateRangeProp = bookingsBody.properties.find(p => p.key === 'date_range') as PropertyNode;
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

    // Find the test table
    const testNode = nodes.find(
      (node) =>
        node instanceof ExportStatementNode &&
        node.argument instanceof InterfaceDeclarationNode &&
        node.argument.id.name === 'Test'
    ) as ExportStatementNode;
    
    ok(testNode);
    const testInterface = testNode.argument as InterfaceDeclarationNode;
    const testBody = testInterface.body as ObjectExpressionNode;
    
    // Check that unknown_type falls back to default scalar (string)
    const unknownProp = testBody.properties.find(p => p.key === 'unknown_type') as PropertyNode;
    ok(unknownProp);
    ok(unknownProp.value instanceof IdentifierNode);
    deepStrictEqual(unknownProp.value.name, 'string');
  });

  it('should work with arrays and nullable types', () => {
    const metadata = createMetadata([
      createTable('arrays', [
        createColumn('timestamps', 'timestamptz', { isArray: true }),
        createColumn('nullable_timestamp', 'timestamptz', { isNullable: true }),
        createColumn('nullable_array', 'timestamptz', { isArray: true, isNullable: true }),
      ]),
    ]);

    const nodes = transform({
      dialect: new PostgresDialect(),
      metadata,
      typeMapping: {
        timestamptz: 'Temporal.Instant',
      },
      customImports: {
        Temporal: '@js-temporal/polyfill',
      },
    });

    // Find the arrays table
    const arraysNode = nodes.find(
      (node) =>
        node instanceof ExportStatementNode &&
        node.argument instanceof InterfaceDeclarationNode &&
        node.argument.id.name === 'Arrays'
    ) as ExportStatementNode;
    
    ok(arraysNode);
    const arraysInterface = arraysNode.argument as InterfaceDeclarationNode;
    const arraysBody = arraysInterface.body as ObjectExpressionNode;
    
    // Verify the type mapping is applied correctly with arrays and nullable
    const timestampsProp = arraysBody.properties.find(p => p.key === 'timestamps') as PropertyNode;
    ok(timestampsProp);
    // Should be ArrayType<Temporal.Instant>

    const nullableTimestampProp = arraysBody.properties.find(p => p.key === 'nullable_timestamp') as PropertyNode;
    ok(nullableTimestampProp);
    // Should be Temporal.Instant | null

    const nullableArrayProp = arraysBody.properties.find(p => p.key === 'nullable_array') as PropertyNode;
    ok(nullableArrayProp);
    // Should be ArrayType<Temporal.Instant> | null
  });
});
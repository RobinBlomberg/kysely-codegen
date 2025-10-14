import { Adapter } from '../../adapter';
import { IdentifierNode } from '../../ast/identifier-node';
import {
  JSON_ARRAY_DEFINITION,
  JSON_OBJECT_DEFINITION,
  JSON_PRIMITIVE_DEFINITION,
  JSON_VALUE_DEFINITION,
} from '../../transformer/definitions';

/**
 * ClickHouse adapter for kysely-codegen.
 * Maps ClickHouse data types to TypeScript types.
 */
export class ClickhouseAdapter extends Adapter {
  readonly defaultSchemas: string[] = ['default'];

  override readonly definitions = {
    JsonArray: JSON_ARRAY_DEFINITION,
    JsonObject: JSON_OBJECT_DEFINITION,
    JsonPrimitive: JSON_PRIMITIVE_DEFINITION,
    JsonValue: JSON_VALUE_DEFINITION,
  };

  // ClickHouse native data types
  override readonly scalars = {
    // Boolean
    bool: new IdentifierNode('number'), // ClickHouse Bool is an alias for UInt8

    // Integer types (signed)
    int8: new IdentifierNode('number'),
    int16: new IdentifierNode('number'),
    int32: new IdentifierNode('number'),
    int64: new IdentifierNode('number'), // May overflow JS number (consider bigint)
    int128: new IdentifierNode('number'), // Will overflow JS number but ClickHouse node-client returns a number
    int256: new IdentifierNode('number'), // Will overflow JS number but ClickHouse node-client returns a number

    // Integer types (unsigned)
    uint8: new IdentifierNode('number'),
    uint16: new IdentifierNode('number'),
    uint32: new IdentifierNode('number'),
    uint64: new IdentifierNode('number'), // May overflow JS number (consider bigint)
    uint128: new IdentifierNode('number'), // Will overflow JS number but ClickHouse node-client returns a number
    uint256: new IdentifierNode('number'), // Will overflow JS number but ClickHouse node-client returns a number

    // Floating point
    float32: new IdentifierNode('number'),
    float64: new IdentifierNode('number'),

    // Decimal types (arbitrary precision)
    // ClickHouse node-client returns a number. Cast to a string in your query if needed.
    decimal: new IdentifierNode('number'),
    decimal32: new IdentifierNode('number'),
    decimal64: new IdentifierNode('number'),
    decimal128: new IdentifierNode('number'),
    decimal256: new IdentifierNode('number'),

    // String types
    string: new IdentifierNode('string'),
    fixedstring: new IdentifierNode('string'),

    // Date and time
    date: new IdentifierNode('Date'),
    date32: new IdentifierNode('Date'),
    datetime: new IdentifierNode('Date'),
    datetime64: new IdentifierNode('Date'),

    // UUID
    uuid: new IdentifierNode('string'),

    // IP addresses
    ipv4: new IdentifierNode('string'),
    ipv6: new IdentifierNode('string'),

    // JSON (experimental)
    json: new IdentifierNode('JsonObject'),

    // Special types
    nothing: new IdentifierNode('null'), // Represents only NULL
  };
}

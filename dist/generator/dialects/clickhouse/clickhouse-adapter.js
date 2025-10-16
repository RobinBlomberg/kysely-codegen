"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickhouseAdapter = void 0;
const adapter_1 = require("../../adapter");
const identifier_node_1 = require("../../ast/identifier-node");
const definitions_1 = require("../../transformer/definitions");
/**
 * ClickHouse adapter for kysely-codegen.
 * Maps ClickHouse data types to TypeScript types.
 */
class ClickhouseAdapter extends adapter_1.Adapter {
    constructor() {
        super(...arguments);
        this.defaultSchemas = ['default'];
        this.definitions = {
            JsonArray: definitions_1.JSON_ARRAY_DEFINITION,
            JsonObject: definitions_1.JSON_OBJECT_DEFINITION,
            JsonPrimitive: definitions_1.JSON_PRIMITIVE_DEFINITION,
            JsonValue: definitions_1.JSON_VALUE_DEFINITION,
        };
        // ClickHouse native data types
        this.scalars = {
            // Boolean
            bool: new identifier_node_1.IdentifierNode('number'), // ClickHouse Bool is an alias for UInt8
            // Integer types (signed)
            int8: new identifier_node_1.IdentifierNode('number'),
            int16: new identifier_node_1.IdentifierNode('number'),
            int32: new identifier_node_1.IdentifierNode('number'),
            int64: new identifier_node_1.IdentifierNode('number'), // May overflow JS number (consider bigint)
            int128: new identifier_node_1.IdentifierNode('number'), // Will overflow JS number but ClickHouse node-client returns a number
            int256: new identifier_node_1.IdentifierNode('number'), // Will overflow JS number but ClickHouse node-client returns a number
            // Integer types (unsigned)
            uint8: new identifier_node_1.IdentifierNode('number'),
            uint16: new identifier_node_1.IdentifierNode('number'),
            uint32: new identifier_node_1.IdentifierNode('number'),
            uint64: new identifier_node_1.IdentifierNode('number'), // May overflow JS number (consider bigint)
            uint128: new identifier_node_1.IdentifierNode('number'), // Will overflow JS number but ClickHouse node-client returns a number
            uint256: new identifier_node_1.IdentifierNode('number'), // Will overflow JS number but ClickHouse node-client returns a number
            // Floating point
            float32: new identifier_node_1.IdentifierNode('number'),
            float64: new identifier_node_1.IdentifierNode('number'),
            // Decimal types (arbitrary precision)
            // ClickHouse node-client returns a number. Cast to a string in your query if needed.
            decimal: new identifier_node_1.IdentifierNode('number'),
            decimal32: new identifier_node_1.IdentifierNode('number'),
            decimal64: new identifier_node_1.IdentifierNode('number'),
            decimal128: new identifier_node_1.IdentifierNode('number'),
            decimal256: new identifier_node_1.IdentifierNode('number'),
            // String types
            string: new identifier_node_1.IdentifierNode('string'),
            fixedstring: new identifier_node_1.IdentifierNode('string'),
            // Date and time
            date: new identifier_node_1.IdentifierNode('Date'),
            date32: new identifier_node_1.IdentifierNode('Date'),
            datetime: new identifier_node_1.IdentifierNode('Date'),
            datetime64: new identifier_node_1.IdentifierNode('Date'),
            // UUID
            uuid: new identifier_node_1.IdentifierNode('string'),
            // IP addresses
            ipv4: new identifier_node_1.IdentifierNode('string'),
            ipv6: new identifier_node_1.IdentifierNode('string'),
            // JSON (experimental)
            json: new identifier_node_1.IdentifierNode('JsonObject'),
            // Special types
            nothing: new identifier_node_1.IdentifierNode('null'), // Represents only NULL
        };
    }
}
exports.ClickhouseAdapter = ClickhouseAdapter;
//# sourceMappingURL=clickhouse-adapter.js.map
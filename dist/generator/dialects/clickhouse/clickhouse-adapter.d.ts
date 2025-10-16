import { Adapter } from '../../adapter';
import { IdentifierNode } from '../../ast/identifier-node';
/**
 * ClickHouse adapter for kysely-codegen.
 * Maps ClickHouse data types to TypeScript types.
 */
export declare class ClickhouseAdapter extends Adapter {
    readonly defaultSchemas: string[];
    readonly definitions: {
        JsonArray: import("../..").DefinitionNode;
        JsonObject: import("../..").DefinitionNode;
        JsonPrimitive: import("../..").DefinitionNode;
        JsonValue: import("../..").DefinitionNode;
    };
    readonly scalars: {
        bool: IdentifierNode;
        int8: IdentifierNode;
        int16: IdentifierNode;
        int32: IdentifierNode;
        int64: IdentifierNode;
        int128: IdentifierNode;
        int256: IdentifierNode;
        uint8: IdentifierNode;
        uint16: IdentifierNode;
        uint32: IdentifierNode;
        uint64: IdentifierNode;
        uint128: IdentifierNode;
        uint256: IdentifierNode;
        float32: IdentifierNode;
        float64: IdentifierNode;
        decimal: IdentifierNode;
        decimal32: IdentifierNode;
        decimal64: IdentifierNode;
        decimal128: IdentifierNode;
        decimal256: IdentifierNode;
        string: IdentifierNode;
        fixedstring: IdentifierNode;
        date: IdentifierNode;
        date32: IdentifierNode;
        datetime: IdentifierNode;
        datetime64: IdentifierNode;
        uuid: IdentifierNode;
        ipv4: IdentifierNode;
        ipv6: IdentifierNode;
        json: IdentifierNode;
        nothing: IdentifierNode;
    };
}

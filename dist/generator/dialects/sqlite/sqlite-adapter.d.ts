import { Adapter } from '../../adapter';
import { IdentifierNode } from '../../ast/identifier-node';
export declare class SqliteAdapter extends Adapter {
    readonly defaultScalar: IdentifierNode;
    readonly scalars: {
        any: IdentifierNode;
        blob: IdentifierNode;
        boolean: IdentifierNode;
        integer: IdentifierNode;
        numeric: IdentifierNode;
        real: IdentifierNode;
        text: IdentifierNode;
    };
}

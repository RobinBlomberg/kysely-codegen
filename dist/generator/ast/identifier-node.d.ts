export declare class IdentifierNode {
    readonly isTableIdentifier: boolean;
    name: string;
    readonly type = "Identifier";
    constructor(name: string, options?: {
        isTableIdentifier?: boolean;
    });
}
export declare class TableIdentifierNode extends IdentifierNode {
    constructor(name: string);
}

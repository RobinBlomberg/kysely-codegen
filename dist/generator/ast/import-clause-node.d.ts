export declare class ImportClauseNode {
    readonly alias: string | null;
    readonly name: string;
    readonly type = "ImportClause";
    constructor(name: string, alias?: string | null);
}

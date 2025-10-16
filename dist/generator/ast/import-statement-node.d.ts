import type { ImportClauseNode } from './import-clause-node';
export declare class ImportStatementNode {
    readonly imports: ImportClauseNode[];
    readonly moduleName: string;
    readonly type = "ImportStatement";
    constructor(moduleName: string, imports: ImportClauseNode[]);
}

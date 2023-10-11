import { ImportClauseNode } from './import-clause-node';
import { NodeType } from './node-type';

export class ImportStatementNode {
  readonly imports: ImportClauseNode[];
  readonly moduleName: string;
  readonly type = NodeType.IMPORT_STATEMENT;

  constructor(moduleName: string, imports: ImportClauseNode[]) {
    this.moduleName = moduleName;
    this.imports = imports;
  }
}

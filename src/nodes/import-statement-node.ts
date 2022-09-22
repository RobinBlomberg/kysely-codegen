import { NodeType } from '../enums';
import { ImportClauseNode } from './import-clause-node';

export class ImportStatementNode {
  readonly imports: ImportClauseNode[];
  readonly moduleName: string;
  readonly type = NodeType.IMPORT_STATEMENT;

  constructor(moduleName: string, imports: ImportClauseNode[]) {
    this.moduleName = moduleName;
    this.imports = imports;
  }
}

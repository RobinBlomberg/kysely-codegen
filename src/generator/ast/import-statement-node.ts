import type { ImportClauseNode } from './import-clause-node.js';
import { NodeType } from './node-type.js';

export class ImportStatementNode {
  readonly imports: ImportClauseNode[];
  readonly moduleName: string;
  readonly type = NodeType.IMPORT_STATEMENT;

  constructor(moduleName: string, imports: ImportClauseNode[]) {
    this.moduleName = moduleName;
    this.imports = imports;
  }
}

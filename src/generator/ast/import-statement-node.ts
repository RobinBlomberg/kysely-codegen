import type { ImportClauseNode } from './import-clause-node';

export class ImportStatementNode {
  readonly imports: ImportClauseNode[];
  readonly moduleName: string;
  readonly type = 'ImportStatement';

  constructor(moduleName: string, imports: ImportClauseNode[]) {
    this.moduleName = moduleName;
    this.imports = imports;
  }
}

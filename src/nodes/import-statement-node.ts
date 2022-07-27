import { NodeType } from '../enums/node-type';

export class ImportStatementNode {
  readonly imports: string[];
  readonly moduleName: string;
  readonly type = NodeType.IMPORT_STATEMENT;

  constructor(moduleName: string, importNames: string[]) {
    this.moduleName = moduleName;
    this.imports = importNames;
  }
}

import { NodeType } from '../enums';

export class ImportClauseNode {
  readonly alias: string | null;
  readonly name: string;
  readonly type = NodeType.IMPORT_CLAUSE;

  constructor(name: string, alias: string | null = null) {
    this.name = name;
    this.alias = alias;
  }
}

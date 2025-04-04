export class ImportClauseNode {
  readonly alias: string | null;
  readonly name: string;
  readonly type = 'ImportClause';

  constructor(name: string, alias: string | null = null) {
    this.name = name;
    this.alias = alias;
  }
}

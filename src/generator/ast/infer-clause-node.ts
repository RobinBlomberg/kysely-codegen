export class InferClauseNode {
  readonly name: string;
  readonly type = 'InferClause';

  constructor(name: string) {
    this.name = name;
  }
}

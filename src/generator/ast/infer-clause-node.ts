import { NodeType } from './node-type';

export class InferClauseNode {
  readonly name: string;
  readonly type = NodeType.INFER_CLAUSE;

  constructor(name: string) {
    this.name = name;
  }
}

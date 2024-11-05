import { NodeType } from './node-type';
import type { RawExpressionNode } from './raw-expression-node';

export class IdentifierNode {
  readonly name: string;
  readonly type = NodeType.IDENTIFIER;
  readonly rawExpressionOverride: RawExpressionNode | undefined;

  constructor(name: string, rawExpressionOverride?: RawExpressionNode) {
    this.name = name;
    this.rawExpressionOverride = rawExpressionOverride;
  }
}

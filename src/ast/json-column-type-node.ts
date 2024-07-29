import type { ExpressionNode } from './expression-node';
import { GenericExpressionNode } from './generic-expression-node';

export class JsonColumnTypeNode extends GenericExpressionNode {
  constructor(
    selectType: ExpressionNode,
    ...args:
      | []
      | [insertType: ExpressionNode]
      | [insertType: ExpressionNode, updateType: ExpressionNode]
  ) {
    super('JSONColumnType', [selectType, ...args]);
  }
}

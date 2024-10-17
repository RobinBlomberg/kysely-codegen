import type { ExpressionNode } from './expression-node';
import { GenericExpressionNode } from './generic-expression-node';

export class ColumnTypeNode extends GenericExpressionNode {
  constructor(
    selectType: ExpressionNode,
    ...insertAndUpdateTypes:
      | []
      | [insertType: ExpressionNode]
      | [insertType: ExpressionNode, updateType: ExpressionNode]
  ) {
    super('ColumnType', [selectType, ...insertAndUpdateTypes]);
  }
}

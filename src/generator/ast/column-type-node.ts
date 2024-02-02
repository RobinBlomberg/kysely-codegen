import type { ExpressionNode } from './expression-node.js';
import { GenericExpressionNode } from './generic-expression-node.js';

export class ColumnType extends GenericExpressionNode {
  constructor(
    selectType: ExpressionNode,
    insertType = selectType,
    updateType = insertType,
  ) {
    super('ColumnType', [selectType, insertType, updateType]);
  }
}

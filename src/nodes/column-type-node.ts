import { ExpressionNode } from './expression-node';
import { GenericExpressionNode } from './generic-expression-node';

export class ColumnType extends GenericExpressionNode {
  constructor(
    selectType: ExpressionNode,
    insertType = selectType,
    updateType = insertType,
  ) {
    super('ColumnType', [selectType, insertType, updateType]);
  }
}

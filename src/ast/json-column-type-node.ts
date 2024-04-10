import type { ExpressionNode } from './expression-node';
import { GenericExpressionNode } from './generic-expression-node';
import { IdentifierNode } from './identifier-node';

export class JSONColumnType extends GenericExpressionNode {
  constructor(selectType: ExpressionNode) {
    super('ColumnType', [
      selectType,
      new IdentifierNode('string'),
      new IdentifierNode('string'),
    ]);
  }
}

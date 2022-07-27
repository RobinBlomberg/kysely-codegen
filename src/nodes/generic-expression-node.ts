import { NodeType } from '../enums/node-type';
import { ExpressionNode } from './expression-node';

export class GenericExpressionNode {
  static createColumnType(
    selectType: ExpressionNode,
    insertType = selectType,
    updateType = insertType,
  ) {
    return new GenericExpressionNode('ColumnType', [
      selectType,
      insertType,
      updateType,
    ]);
  }

  readonly args: ExpressionNode[];
  readonly name: string;
  readonly type = NodeType.GENERIC_EXPRESSION;

  constructor(name: string, args: ExpressionNode[]) {
    this.name = name;
    this.args = args;
  }
}

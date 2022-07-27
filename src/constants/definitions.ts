import { AdapterDefinitions } from '../adapter';
import { ExpressionNode } from '../nodes/expression-node';
import { ExtendsClauseNode } from '../nodes/extends-clause-node';
import { GenericExpressionNode } from '../nodes/generic-expression-node';
import { IdentifierNode } from '../nodes/identifier-node';
import { InferClauseNode } from '../nodes/infer-clause-node';
import { UnionExpressionNode } from '../nodes/union-expression-node';

export type Definition = ExpressionNode | [string[], ExpressionNode];

export const DEFINITIONS: AdapterDefinitions = {
  Generated: [
    ['T'],
    new ExtendsClauseNode(
      'T',
      new GenericExpressionNode('ColumnType', [
        new InferClauseNode('S'),
        new InferClauseNode('I'),
        new InferClauseNode('U'),
      ]),
      new GenericExpressionNode('ColumnType', [
        new IdentifierNode('S'),
        new UnionExpressionNode([
          new IdentifierNode('I'),
          new IdentifierNode('undefined'),
        ]),
        new IdentifierNode('U'),
      ]),
      new GenericExpressionNode('ColumnType', [
        new IdentifierNode('T'),
        new UnionExpressionNode([
          new IdentifierNode('T'),
          new IdentifierNode('undefined'),
        ]),
        new IdentifierNode('T'),
      ]),
    ),
  ],
};

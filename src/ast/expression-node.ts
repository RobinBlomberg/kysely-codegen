import { ArrayExpressionNode } from './array-expression-node';
import { ExtendsClauseNode } from './extends-clause-node';
import { GenericExpressionNode } from './generic-expression-node';
import { IdentifierNode } from './identifier-node';
import { InferClauseNode } from './infer-clause-node';
import { LiteralNode } from './literal-node';
import { MappedTypeNode } from './mapped-type-node';
import { ObjectExpressionNode } from './object-expression-node';
import { UnionExpressionNode } from './union-expression-node';

export type ExpressionNode =
  | ArrayExpressionNode
  | ExtendsClauseNode
  | GenericExpressionNode
  | IdentifierNode
  | InferClauseNode
  | LiteralNode
  | MappedTypeNode
  | ObjectExpressionNode
  | UnionExpressionNode;

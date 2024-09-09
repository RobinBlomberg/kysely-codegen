import type { ArrayExpressionNode } from './array-expression-node';
import type { ExtendsClauseNode } from './extends-clause-node';
import type { GenericExpressionNode } from './generic-expression-node';
import type { IdentifierNode } from './identifier-node';
import type { InferClauseNode } from './infer-clause-node';
import type { LiteralNode } from './literal-node';
import type { MappedTypeNode } from './mapped-type-node';
import type { ObjectExpressionNode } from './object-expression-node';
import type { RawExpressionNode } from './raw-expression-node';
import type { UnionExpressionNode } from './union-expression-node';

export type ExpressionNode =
  | ArrayExpressionNode
  | ExtendsClauseNode
  | GenericExpressionNode
  | IdentifierNode
  | InferClauseNode
  | LiteralNode
  | MappedTypeNode
  | ObjectExpressionNode
  | RawExpressionNode
  | UnionExpressionNode;

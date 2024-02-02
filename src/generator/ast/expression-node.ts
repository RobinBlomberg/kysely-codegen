import type { ArrayExpressionNode } from './array-expression-node.js';
import type { ExtendsClauseNode } from './extends-clause-node.js';
import type { GenericExpressionNode } from './generic-expression-node.js';
import type { IdentifierNode } from './identifier-node.js';
import type { InferClauseNode } from './infer-clause-node.js';
import type { LiteralNode } from './literal-node.js';
import type { MappedTypeNode } from './mapped-type-node.js';
import type { ObjectExpressionNode } from './object-expression-node.js';
import type { UnionExpressionNode } from './union-expression-node.js';

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

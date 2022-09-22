import { ExpressionNode, IdentifierNode, UnionExpressionNode } from '../nodes';

export const unionize = (args: ExpressionNode[]) => {
  switch (args.length) {
    case 0:
      return new IdentifierNode('never');
    case 1:
      return args[0]!;
    default:
      return new UnionExpressionNode(args);
  }
};

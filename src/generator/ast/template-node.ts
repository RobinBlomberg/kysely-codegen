import type { ExpressionNode } from './expression-node';

export class TemplateNode {
  readonly expression: ExpressionNode;
  readonly params: string[];
  readonly type = 'Template';

  constructor(params: string[], expression: ExpressionNode) {
    this.params = params;
    this.expression = expression;
  }
}

import type { PropertyNode } from './property-node';

export class ObjectExpressionNode {
  readonly properties: PropertyNode[];
  readonly type = 'ObjectExpression';

  constructor(properties: PropertyNode[]) {
    this.properties = properties;
  }
}

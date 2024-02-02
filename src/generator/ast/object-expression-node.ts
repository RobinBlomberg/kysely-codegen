import { NodeType } from './node-type.js';
import type { PropertyNode } from './property-node.js';

export class ObjectExpressionNode {
  readonly properties: PropertyNode[];
  readonly type = NodeType.OBJECT_EXPRESSION;

  constructor(properties: PropertyNode[]) {
    this.properties = properties;
  }
}

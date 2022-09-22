import { NodeType } from '../enums';
import { PropertyNode } from './property-node';

export class ObjectExpressionNode {
  readonly properties: PropertyNode[];
  readonly type = NodeType.OBJECT_EXPRESSION;

  constructor(properties: PropertyNode[]) {
    this.properties = properties;
  }
}

import { NodeType } from '../enums/node-type';
import { PropertyNode } from './property-node';

export class ObjectExpressionNode {
  readonly properties: PropertyNode[];
  readonly type = NodeType.OBJECT_EXPRESSION;

  constructor(body: PropertyNode[]) {
    this.properties = body;
  }
}

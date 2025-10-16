import type { PropertyNode } from './property-node';
export declare class ObjectExpressionNode {
    readonly properties: PropertyNode[];
    readonly type = "ObjectExpression";
    constructor(properties: PropertyNode[]);
}

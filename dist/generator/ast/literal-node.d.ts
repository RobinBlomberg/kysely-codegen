type Literal = number | string;
export declare class LiteralNode<T extends Literal = Literal> {
    readonly type = "Literal";
    readonly value: T;
    constructor(value: T);
}
export {};

export declare class TableMatcher {
    isMatch: (string: string) => boolean;
    isSimpleGlob: boolean;
    constructor(pattern: string);
    match(schema: string | undefined, name: string): boolean;
}

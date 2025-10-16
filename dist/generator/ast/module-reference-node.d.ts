export declare class ModuleReferenceNode {
    readonly name: string;
    /**
     * The name of the export in the source module when using named imports.
     * For example, in `"MyType": "./types#OriginalType"`, the `sourceName` is
     * "OriginalType". This would generate the following:
     *
     * ```ts
     * import { OriginalType as MyType } from './types';
     * ```
     */
    readonly sourceName?: string;
    readonly type = "ModuleReference";
    constructor(name: string, sourceName?: string);
}

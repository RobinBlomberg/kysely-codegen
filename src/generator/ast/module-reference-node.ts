export class ModuleReferenceNode {
  readonly name: string;
  /**
   * The name of the export in the source module when using named imports.
   * For example, in `"MyType": "./types#OriginalType"`, sourceName is "OriginalType".
   * This generates: `import { OriginalType as MyType } from './types'`
   */
  readonly sourceName?: string;
  readonly type = 'ModuleReference';

  constructor(name: string, sourceName?: string) {
    this.name = name;
    this.sourceName = sourceName;
  }
}

export class ModuleReferenceNode {
  readonly name: string;
  readonly exportName?: string;
  readonly type = 'ModuleReference';

  constructor(name: string, exportName?: string) {
    this.name = name;
    this.exportName = exportName;
  }
}

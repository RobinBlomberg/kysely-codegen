export class ModuleReferenceNode {
  readonly name: string;
  readonly type = 'ModuleReference';

  constructor(name: string) {
    this.name = name;
  }
}

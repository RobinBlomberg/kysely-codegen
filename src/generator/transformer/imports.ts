import { ModuleReferenceNode } from '../ast/module-reference-node';

export const GLOBAL_IMPORTS = {
  ColumnType: new ModuleReferenceNode('kysely'),
  JSONColumnType: new ModuleReferenceNode('kysely'),
};

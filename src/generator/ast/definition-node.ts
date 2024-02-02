import type { ExpressionNode } from './expression-node.js';
import type { TemplateNode } from './template-node.js';

export type DefinitionNode = ExpressionNode | TemplateNode;

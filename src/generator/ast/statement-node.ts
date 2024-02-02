import type { ExportStatementNode } from './export-statement-node.js';
import type { ImportStatementNode } from './import-statement-node.js';

export type StatementNode = ExportStatementNode | ImportStatementNode;

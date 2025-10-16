import type { DatabaseMetadata } from '../../introspector/metadata/database-metadata';
import { AliasDeclarationNode } from '../ast/alias-declaration-node';
import { ExportStatementNode } from '../ast/export-statement-node';
import type { ExpressionNode } from '../ast/expression-node';
import { ImportStatementNode } from '../ast/import-statement-node';
import { InterfaceDeclarationNode } from '../ast/interface-declaration-node';
import { RuntimeEnumDeclarationNode } from '../ast/runtime-enum-declaration-node';
import type { GeneratorDialect } from '../dialect';
import type { RuntimeEnumsStyle } from '../generator/runtime-enums-style';
export type Overrides = {
    /**
     * Specifies type overrides for columns.
     *
     * @example
     * ```ts
     * // Allows overriding of columns to be a type-safe JSON column:
     * {
     *   columns: {
     *     "<table_name>.<column_name>": new JsonColumnType(
     *       new RawExpressionNode("{ postalCode: string; street: string; city: string }")
     *     ),
     *   }
     * }
     * ```
     */
    columns?: Record<string, ExpressionNode | string>;
};
export type TransformOptions = {
    camelCase?: boolean;
    customImports?: Record<string, string>;
    defaultSchemas?: string[];
    dialect: GeneratorDialect;
    metadata: DatabaseMetadata;
    overrides?: Overrides;
    runtimeEnums?: boolean | RuntimeEnumsStyle;
    typeMapping?: Record<string, string>;
};
export declare const transform: (options: TransformOptions) => (ImportStatementNode | ExportStatementNode<AliasDeclarationNode | InterfaceDeclarationNode | RuntimeEnumDeclarationNode>)[];

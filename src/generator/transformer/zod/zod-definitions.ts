import type { DefinitionNode } from "../../ast/definition-node";
import { RawExpressionNode } from "../../ast/raw-expression-node";

export const GLOBAL_ZOD_DEFINITIONS = {
}

export const JSON_SCHEMA_DEFINITION: DefinitionNode = new RawExpressionNode("z.lazy(():z.ZodType => z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(JsonSchema), z.record(JsonSchema)]));");

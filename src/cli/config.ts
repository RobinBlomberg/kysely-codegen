import { z } from 'zod';
import type {
  LogLevel,
  Overrides,
  RuntimeEnumsStyle,
  Serializer,
} from '../generator';
import {
  ArrayExpressionNode,
  ExtendsClauseNode,
  GenericExpressionNode,
  IdentifierNode,
  InferClauseNode,
  LiteralNode,
  LOG_LEVELS,
  Logger,
  MappedTypeNode,
  ObjectExpressionNode,
  RawExpressionNode,
  UnionExpressionNode,
} from '../generator';
import type { DateParser, NumericParser } from '../introspector';
import { DatabaseMetadata, IntrospectorDialect } from '../introspector';

export type Config = {
  camelCase?: boolean;
  dateParser?: DateParser;
  defaultSchemas?: string[];
  dialect?: DialectName;
  domains?: boolean;
  envFile?: string;
  excludePattern?: string | null;
  includePattern?: string | null;
  logger?: Logger;
  logLevel?: LogLevel;
  numericParser?: NumericParser;
  outFile?: string | null;
  overrides?: Overrides;
  partitions?: boolean;
  print?: boolean;
  runtimeEnums?: boolean | RuntimeEnumsStyle;
  serializer?: Serializer;
  singularize?: boolean | Record<string, string>;
  skipAutogeneratedFileComment?: boolean;
  typeOnlyImports?: boolean;
  url?: string;
  verify?: boolean;
};

export type DialectName = z.infer<typeof dialectNameSchema>;

export const dialectNameSchema = z.enum([
  'bun-sqlite',
  'kysely-bun-sqlite',
  'libsql',
  'mssql',
  'mysql',
  'postgres',
  'sqlite',
  'worker-bun-sqlite',
]);

const expressionNodeSchema = z.union([
  z.instanceof(ArrayExpressionNode),
  z.instanceof(ExtendsClauseNode),
  z.instanceof(GenericExpressionNode),
  z.instanceof(IdentifierNode),
  z.instanceof(InferClauseNode),
  z.instanceof(LiteralNode),
  z.instanceof(MappedTypeNode),
  z.instanceof(ObjectExpressionNode),
  z.instanceof(RawExpressionNode),
  z.instanceof(UnionExpressionNode),
  z.string(),
]);

const overridesSchema = z
  .object({ columns: z.record(z.string(), expressionNodeSchema).optional() })
  .optional();

export const configSchema = z.object({
  camelCase: z.boolean().optional(),
  dateParser: z
    .enum<DateParser, ['string', 'timestamp']>(['string', 'timestamp'])
    .optional(),
  defaultSchemas: z.array(z.string()).optional(),
  dialect: dialectNameSchema.optional(),
  domains: z.boolean().optional(),
  envFile: z.string().optional(),
  excludePattern: z.string().nullable().optional(),
  includePattern: z.string().nullable().optional(),
  logger: z.instanceof(Logger).optional(),
  logLevel: z.enum(LOG_LEVELS).optional(),
  numericParser: z
    .enum<
      NumericParser,
      ['number', 'number-or-string', 'string']
    >(['number', 'number-or-string', 'string'])
    .optional(),
  outFile: z.string().nullable().optional(),
  overrides: overridesSchema.optional(),
  partitions: z.boolean().optional(),
  print: z.boolean().optional(),
  runtimeEnums: z
    .union([
      z.boolean(),
      z.enum<RuntimeEnumsStyle, ['pascal-case', 'screaming-snake-case']>([
        'pascal-case',
        'screaming-snake-case',
      ]),
    ])
    .optional(),
  serializer: z
    .object({
      serializeFile: z.function(
        z.tuple([
          z.instanceof(DatabaseMetadata),
          z.instanceof(IntrospectorDialect),
          z
            .object({
              camelCase: z.boolean().optional(),
              defaultSchemas: z.string().array().optional(),
              overrides: overridesSchema.optional(),
            })
            .optional(),
        ]),
        z.string(),
      ),
    })
    .optional(),
  singularize: z
    .union([z.boolean(), z.record(z.string(), z.string())])
    .optional(),
  skipAutogeneratedFileComment: z.boolean().optional(),
  typeOnlyImports: z.boolean().optional(),
  url: z.string().optional(),
  verify: z.boolean().optional(),
});

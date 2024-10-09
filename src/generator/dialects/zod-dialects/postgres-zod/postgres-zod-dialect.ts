import type { NumericParser } from "../../../../introspector";
import { PostgresIntrospectorDialect } from "../../../../introspector";
import type { GeneratorDialect } from "../../../dialect";
import { PostgresZodAdapter } from "./postgres-zod-adapter";

type PostgresDialectOptions = {
  defaultSchemas?: string[];
  domains?: boolean;
  numericParser?: NumericParser;
  partitions?: boolean;
};

export class PostgresZodDialect
  extends PostgresIntrospectorDialect
  implements GeneratorDialect
{
  readonly adapter: PostgresZodAdapter;

  constructor(options?: PostgresDialectOptions) {
    super(options);

    this.adapter = new PostgresZodAdapter({
      numericParser: this.options.numericParser,
    });
  }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresDialect = void 0;
const postgres_dialect_1 = require("../../../introspector/dialects/postgres/postgres-dialect");
const postgres_adapter_1 = require("./postgres-adapter");
class PostgresDialect extends postgres_dialect_1.PostgresIntrospectorDialect {
    constructor(options) {
        super({
            dateParser: options?.dateParser,
            defaultSchemas: options?.defaultSchemas,
            domains: options?.domains,
            numericParser: options?.numericParser,
            partitions: options?.partitions,
        });
        this.adapter = new postgres_adapter_1.PostgresAdapter({
            dateParser: this.options.dateParser,
            numericParser: this.options.numericParser,
        });
    }
}
exports.PostgresDialect = PostgresDialect;
//# sourceMappingURL=postgres-dialect.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KyselyBunSqliteDialect = void 0;
const kysely_bun_sqlite_dialect_1 = require("../../../introspector/dialects/kysely-bun-sqlite/kysely-bun-sqlite-dialect");
const kysely_bun_sqlite_adapter_1 = require("./kysely-bun-sqlite-adapter");
class KyselyBunSqliteDialect extends kysely_bun_sqlite_dialect_1.KyselyBunSqliteIntrospectorDialect {
    constructor() {
        super(...arguments);
        this.adapter = new kysely_bun_sqlite_adapter_1.KyselyBunSqliteAdapter();
    }
}
exports.KyselyBunSqliteDialect = KyselyBunSqliteDialect;
//# sourceMappingURL=kysely-bun-sqlite-dialect.js.map
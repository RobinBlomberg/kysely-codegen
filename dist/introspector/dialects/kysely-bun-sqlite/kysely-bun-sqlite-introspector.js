"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KyselyBunSqliteIntrospector = void 0;
const enum_collection_1 = require("../../enum-collection");
const introspector_1 = require("../../introspector");
const database_metadata_1 = require("../../metadata/database-metadata");
class KyselyBunSqliteIntrospector extends introspector_1.Introspector {
    async introspect(options) {
        const tables = await this.getTables(options);
        const enums = new enum_collection_1.EnumCollection();
        return new database_metadata_1.DatabaseMetadata({ enums, tables });
    }
}
exports.KyselyBunSqliteIntrospector = KyselyBunSqliteIntrospector;
//# sourceMappingURL=kysely-bun-sqlite-introspector.js.map
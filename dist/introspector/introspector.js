"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Introspector = void 0;
const kysely_1 = require("kysely");
const table_matcher_1 = require("./table-matcher");
/**
 * Analyzes and returns metadata for a connected database.
 */
class Introspector {
    async establishDatabaseConnection(db) {
        return await (0, kysely_1.sql) `SELECT 1;`.execute(db);
    }
    async connect(options) {
        // Insane solution in lieu of a better one.
        // We'll create a database connection with SSL, and if it complains about SSL, try without it.
        for (const ssl of [true, false]) {
            try {
                const dialect = await options.dialect.createKyselyDialect({
                    connectionString: options.connectionString,
                    ssl,
                });
                const db = new kysely_1.Kysely({ dialect });
                await this.establishDatabaseConnection(db);
                return db;
            }
            catch (error) {
                const isSslError = error instanceof Error && /\bSSL\b/.test(error.message);
                const isUnexpectedError = !ssl || !isSslError;
                if (isUnexpectedError) {
                    throw error;
                }
            }
        }
        throw new Error('Failed to connect to database.');
    }
    async getTables(options) {
        let tables = await options.db.introspection.getTables();
        if (options.includePattern) {
            const tableMatcher = new table_matcher_1.TableMatcher(options.includePattern);
            tables = tables.filter(({ name, schema }) => tableMatcher.match(schema, name));
        }
        if (options.excludePattern) {
            const tableMatcher = new table_matcher_1.TableMatcher(options.excludePattern);
            tables = tables.filter(({ name, schema }) => !tableMatcher.match(schema, name));
        }
        return tables;
    }
}
exports.Introspector = Introspector;
//# sourceMappingURL=introspector.js.map
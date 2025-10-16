"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDialect = exports.GeneratorDialect = void 0;
const dialect_1 = require("../introspector/dialect");
const clickhouse_dialect_1 = require("./dialects/clickhouse/clickhouse-dialect");
const kysely_bun_sqlite_dialect_1 = require("./dialects/kysely-bun-sqlite/kysely-bun-sqlite-dialect");
const libsql_dialect_1 = require("./dialects/libsql/libsql-dialect");
const mssql_dialect_1 = require("./dialects/mssql/mssql-dialect");
const mysql_dialect_1 = require("./dialects/mysql/mysql-dialect");
const postgres_dialect_1 = require("./dialects/postgres/postgres-dialect");
const sqlite_dialect_1 = require("./dialects/sqlite/sqlite-dialect");
const worker_bun_sqlite_dialect_1 = require("./dialects/worker-bun-sqlite/worker-bun-sqlite-dialect");
/**
 * A Dialect is the glue between the codegen and the specified database.
 */
class GeneratorDialect extends dialect_1.IntrospectorDialect {
}
exports.GeneratorDialect = GeneratorDialect;
const getDialect = (name, options) => {
    switch (name) {
        case 'clickhouse':
            return new clickhouse_dialect_1.ClickhouseDialect();
        case 'kysely-bun-sqlite':
            return new kysely_bun_sqlite_dialect_1.KyselyBunSqliteDialect();
        case 'libsql':
            return new libsql_dialect_1.LibsqlDialect();
        case 'mssql':
            return new mssql_dialect_1.MssqlDialect();
        case 'mysql':
            return new mysql_dialect_1.MysqlDialect();
        case 'postgres':
            return new postgres_dialect_1.PostgresDialect(options);
        case 'bun-sqlite': // Legacy.
        case 'worker-bun-sqlite':
            return new worker_bun_sqlite_dialect_1.WorkerBunSqliteDialect();
        default:
            return new sqlite_dialect_1.SqliteDialect();
    }
};
exports.getDialect = getDialect;
//# sourceMappingURL=dialect.js.map
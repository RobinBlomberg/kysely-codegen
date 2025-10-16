"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_DIALECTS = exports.LOG_LEVEL_NAMES = exports.DEFAULT_URL = exports.DEFAULT_RUNTIME_ENUMS_STYLE = void 0;
exports.DEFAULT_RUNTIME_ENUMS_STYLE = 'screaming-snake-case';
exports.DEFAULT_URL = 'env(DATABASE_URL)';
exports.LOG_LEVEL_NAMES = [
    'debug',
    'info',
    'warn',
    'error',
    'silent',
];
exports.VALID_DIALECTS = [
    'postgres',
    'mysql',
    'sqlite',
    'mssql',
    'libsql',
    'bun-sqlite',
    'kysely-bun-sqlite',
    'worker-bun-sqlite',
    'clickhouse',
];
//# sourceMappingURL=constants.js.map
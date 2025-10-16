"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ConnectionStringParser_instances, _ConnectionStringParser_inferDialectName;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionStringParser = void 0;
const dotenv_1 = require("dotenv");
const dotenv_expand_1 = require("dotenv-expand");
const CALL_STATEMENT_REGEXP = /^\s*([a-z]+)\s*\(\s*(.*)\s*\)\s*$/;
const DIALECT_PARTS_REGEXP = /([^:]*)(.*)/;
/**
 * Parses a connection string URL or loads it from an environment file.
 * Upon success, it also returns which dialect was inferred from the connection string.
 */
class ConnectionStringParser {
    constructor() {
        _ConnectionStringParser_instances.add(this);
    }
    parse(options) {
        let connectionString = options.connectionString;
        const expressionMatch = connectionString.match(CALL_STATEMENT_REGEXP);
        if (expressionMatch) {
            const name = expressionMatch[1];
            if (name !== 'env') {
                throw new ReferenceError(`Function '${name}' is not defined.`);
            }
            const keyToken = expressionMatch[2];
            let key;
            try {
                key = keyToken.includes('"') ? JSON.parse(keyToken) : keyToken;
            }
            catch {
                throw new SyntaxError(`Invalid connection string: '${connectionString}'`);
            }
            if (typeof key !== 'string') {
                throw new TypeError(`Argument 0 of function '${name}' must be a string.`);
            }
            const { error } = (0, dotenv_expand_1.expand)((0, dotenv_1.config)({ path: options.envFile }));
            const displayEnvFile = options.envFile ?? '.env';
            if (error) {
                if ('code' in error &&
                    typeof error.code === 'string' &&
                    error.code === 'ENOENT') {
                    if (options.envFile !== undefined) {
                        throw new ReferenceError(`Could not resolve connection string '${connectionString}'. ` +
                            `Environment file '${displayEnvFile}' could not be found. ` +
                            "Use '--env-file' to specify a different file.");
                    }
                }
                else {
                    throw error;
                }
            }
            else {
                options.logger?.info(`Loaded environment variables from '${displayEnvFile}'.`);
            }
            const envConnectionString = process.env[key];
            if (!envConnectionString) {
                throw new ReferenceError(`Environment variable '${key}' could not be found.`);
            }
            connectionString = envConnectionString;
        }
        const parts = connectionString.match(DIALECT_PARTS_REGEXP);
        const protocol = parts[1];
        const tail = parts[2];
        const normalizedConnectionString = protocol === 'pg' ? `postgres${tail}` : connectionString;
        const dialect = options.dialect ?? __classPrivateFieldGet(this, _ConnectionStringParser_instances, "m", _ConnectionStringParser_inferDialectName).call(this, connectionString);
        return {
            connectionString: normalizedConnectionString,
            dialect,
        };
    }
}
exports.ConnectionStringParser = ConnectionStringParser;
_ConnectionStringParser_instances = new WeakSet(), _ConnectionStringParser_inferDialectName = function _ConnectionStringParser_inferDialectName(connectionString) {
    if (connectionString.startsWith('libsql')) {
        return 'libsql';
    }
    if (connectionString.startsWith('mysql')) {
        return 'mysql';
    }
    if (connectionString.startsWith('postgres') ||
        connectionString.startsWith('pg')) {
        return 'postgres';
    }
    if (connectionString.toLowerCase().includes('user id=')) {
        return 'mssql';
    }
    return 'sqlite';
};
//# sourceMappingURL=connection-string-parser.js.map
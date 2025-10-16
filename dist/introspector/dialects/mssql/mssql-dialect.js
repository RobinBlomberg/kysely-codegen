"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MssqlIntrospectorDialect_instances, _MssqlIntrospectorDialect_parseConnectionString;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MssqlIntrospectorDialect = void 0;
const kysely_1 = require("kysely");
const dialect_1 = require("../../dialect");
const mssql_introspector_1 = require("./mssql-introspector");
const DEFAULT_MSSQL_PORT = 1433;
class MssqlIntrospectorDialect extends dialect_1.IntrospectorDialect {
    constructor() {
        super(...arguments);
        _MssqlIntrospectorDialect_instances.add(this);
        this.introspector = new mssql_introspector_1.MssqlIntrospector();
    }
    async createKyselyDialect(options) {
        const tarn = await Promise.resolve().then(() => __importStar(require('tarn')));
        const tedious = await Promise.resolve().then(() => __importStar(require('tedious')));
        const { database, instanceName, password, port, server, userName } = await __classPrivateFieldGet(this, _MssqlIntrospectorDialect_instances, "m", _MssqlIntrospectorDialect_parseConnectionString).call(this, options.connectionString);
        return new kysely_1.MssqlDialect({
            tarn: {
                ...tarn,
                options: { min: 0, max: 1 },
            },
            tedious: {
                ...tedious,
                connectionFactory: () => {
                    return new tedious.Connection({
                        authentication: {
                            options: { password, userName },
                            type: 'default',
                        },
                        options: {
                            database,
                            encrypt: options.ssl ?? true,
                            instanceName,
                            port,
                            trustServerCertificate: true,
                        },
                        server,
                    });
                },
            },
        });
    }
}
exports.MssqlIntrospectorDialect = MssqlIntrospectorDialect;
_MssqlIntrospectorDialect_instances = new WeakSet(), _MssqlIntrospectorDialect_parseConnectionString = 
/**
 * @see https://www.connectionstrings.com/microsoft-data-sqlclient/using-a-non-standard-port/
 */
async function _MssqlIntrospectorDialect_parseConnectionString(connectionString) {
    const { parseConnectionString } = await Promise.resolve().then(() => __importStar(require('@tediousjs/connection-string')));
    const parsed = parseConnectionString(connectionString);
    const tokens = parsed.server.split(',');
    const serverAndInstance = tokens[0].split('\\');
    const server = serverAndInstance[0];
    const instanceName = serverAndInstance[1];
    // Instance name and port are mutually exclusive.
    // See https://tediousjs.github.io/tedious/api-connection.html#:~:text=options.instanceName.
    const port = instanceName === undefined
        ? tokens[1]
            ? Number.parseInt(tokens[1], 10)
            : DEFAULT_MSSQL_PORT
        : undefined;
    return {
        database: parsed.database,
        instanceName,
        password: parsed.password,
        port,
        server,
        userName: parsed['user id'],
    };
};
//# sourceMappingURL=mssql-dialect.js.map
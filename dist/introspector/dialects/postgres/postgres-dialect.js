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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresIntrospectorDialect = void 0;
const kysely_1 = require("kysely");
const dialect_1 = require("../../dialect");
const date_parser_1 = require("./date-parser");
const numeric_parser_1 = require("./numeric-parser");
const postgres_introspector_1 = require("./postgres-introspector");
class PostgresIntrospectorDialect extends dialect_1.IntrospectorDialect {
    constructor(options) {
        super();
        this.introspector = new postgres_introspector_1.PostgresIntrospector({
            defaultSchemas: options?.defaultSchemas,
            domains: options?.domains,
            partitions: options?.partitions,
        });
        this.options = {
            dateParser: options?.dateParser ?? date_parser_1.DEFAULT_DATE_PARSER,
            defaultSchemas: options?.defaultSchemas,
            domains: options?.domains ?? true,
            numericParser: options?.numericParser ?? numeric_parser_1.DEFAULT_NUMERIC_PARSER,
        };
    }
    async createKyselyDialect(options) {
        const { default: pg } = await Promise.resolve().then(() => __importStar(require('pg')));
        if (this.options.dateParser === 'string') {
            pg.types.setTypeParser(1082, (date) => date);
        }
        if (this.options.numericParser === 'number') {
            pg.types.setTypeParser(1700, Number);
        }
        else if (this.options.numericParser === 'number-or-string') {
            pg.types.setTypeParser(1700, (value) => {
                const number = Number(value);
                return number > Number.MAX_SAFE_INTEGER ||
                    number < Number.MIN_SAFE_INTEGER
                    ? value
                    : number;
            });
        }
        return new kysely_1.PostgresDialect({
            pool: new pg.Pool({
                connectionString: options.connectionString,
                ssl: options.ssl ? { rejectUnauthorized: false } : false,
            }),
        });
    }
}
exports.PostgresIntrospectorDialect = PostgresIntrospectorDialect;
//# sourceMappingURL=postgres-dialect.js.map
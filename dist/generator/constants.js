"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_OUT_FILE = void 0;
const node_path_1 = require("node:path");
exports.DEFAULT_OUT_FILE = (0, node_path_1.join)(process.cwd(), 'node_modules', 'kysely-codegen', 'dist', 'db.d.ts');
//# sourceMappingURL=constants.js.map
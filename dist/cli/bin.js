#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli_1 = require("./cli");
void new cli_1.Cli().run({ argv: process.argv.slice(2) }).then(() => process.exit(0));
//# sourceMappingURL=bin.js.map
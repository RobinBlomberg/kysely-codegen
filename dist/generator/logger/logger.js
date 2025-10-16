"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Logger_instances, _Logger_log, _Logger_shouldLog;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const chalk_1 = __importDefault(require("chalk"));
const util_1 = require("util");
const log_level_1 = require("./log-level");
class Logger {
    constructor(logLevel = 'info') {
        _Logger_instances.add(this);
        this.logLevel = logLevel;
    }
    debug(...values) {
        if (__classPrivateFieldGet(this, _Logger_instances, "m", _Logger_shouldLog).call(this, 'debug')) {
            __classPrivateFieldGet(this, _Logger_instances, "m", _Logger_log).call(this, 'debug', 'gray', null, values);
        }
    }
    error(...values) {
        if (__classPrivateFieldGet(this, _Logger_instances, "m", _Logger_shouldLog).call(this, 'error')) {
            __classPrivateFieldGet(this, _Logger_instances, "m", _Logger_log).call(this, 'error', 'red', '✗', values);
        }
    }
    info(...values) {
        if (__classPrivateFieldGet(this, _Logger_instances, "m", _Logger_shouldLog).call(this, 'info')) {
            __classPrivateFieldGet(this, _Logger_instances, "m", _Logger_log).call(this, 'info', 'blue', '•', values);
        }
    }
    log(...values) {
        if (__classPrivateFieldGet(this, _Logger_instances, "m", _Logger_shouldLog).call(this, 'info')) {
            console.log(...values);
        }
    }
    success(...values) {
        if (__classPrivateFieldGet(this, _Logger_instances, "m", _Logger_shouldLog).call(this, 'info')) {
            __classPrivateFieldGet(this, _Logger_instances, "m", _Logger_log).call(this, 'log', 'green', '✓', values);
        }
    }
    warn(...values) {
        if (__classPrivateFieldGet(this, _Logger_instances, "m", _Logger_shouldLog).call(this, 'warn')) {
            __classPrivateFieldGet(this, _Logger_instances, "m", _Logger_log).call(this, 'warn', 'yellow', '⚠', values);
        }
    }
}
exports.Logger = Logger;
_Logger_instances = new WeakSet(), _Logger_log = function _Logger_log(consoleMethod, color, icon, values) {
    const texts = [...(icon === null ? [] : [icon]), ...values];
    return console[consoleMethod](...texts.map((value) => {
        const text = (typeof value === 'string' ? value : (0, util_1.inspect)(value, { colors: true })).replaceAll(/(\r?\n)/g, icon === null ? '$1' : '$1  ');
        return color ? chalk_1.default[color](text) : text;
    }));
}, _Logger_shouldLog = function _Logger_shouldLog(messageLogLevel) {
    return (0, log_level_1.matchLogLevel)({ actual: this.logLevel, expected: messageLogLevel });
};
//# sourceMappingURL=logger.js.map
"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _DiffChecker_instances, _DiffChecker_sanitize;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiffChecker = void 0;
const git_diff_1 = __importDefault(require("git-diff"));
class DiffChecker {
    constructor() {
        _DiffChecker_instances.add(this);
    }
    diff(oldTypes, newTypes) {
        return (0, git_diff_1.default)(__classPrivateFieldGet(this, _DiffChecker_instances, "m", _DiffChecker_sanitize).call(this, oldTypes), __classPrivateFieldGet(this, _DiffChecker_instances, "m", _DiffChecker_sanitize).call(this, newTypes));
    }
}
exports.DiffChecker = DiffChecker;
_DiffChecker_instances = new WeakSet(), _DiffChecker_sanitize = function _DiffChecker_sanitize(string) {
    // Add `\n` to the end to avoid the "No newline at end of file" warning:
    return `${string.trim()}\n`;
};
//# sourceMappingURL=diff-checker.js.map
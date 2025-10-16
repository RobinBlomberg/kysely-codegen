"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MysqlParser_instances, _MysqlParser_consume, _MysqlParser_createSyntaxError, _MysqlParser_parseEnumBody, _MysqlParser_parseEnumValue;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlParser = void 0;
class MysqlParser {
    constructor(data) {
        _MysqlParser_instances.add(this);
        this.data = '';
        this.index = 0;
        this.data = data;
    }
    parseEnum() {
        __classPrivateFieldGet(this, _MysqlParser_instances, "m", _MysqlParser_consume).call(this, 'e');
        __classPrivateFieldGet(this, _MysqlParser_instances, "m", _MysqlParser_consume).call(this, 'n');
        __classPrivateFieldGet(this, _MysqlParser_instances, "m", _MysqlParser_consume).call(this, 'u');
        __classPrivateFieldGet(this, _MysqlParser_instances, "m", _MysqlParser_consume).call(this, 'm');
        __classPrivateFieldGet(this, _MysqlParser_instances, "m", _MysqlParser_consume).call(this, '(');
        const enums = __classPrivateFieldGet(this, _MysqlParser_instances, "m", _MysqlParser_parseEnumBody).call(this);
        __classPrivateFieldGet(this, _MysqlParser_instances, "m", _MysqlParser_consume).call(this, ')');
        return enums;
    }
}
exports.MysqlParser = MysqlParser;
_MysqlParser_instances = new WeakSet(), _MysqlParser_consume = function _MysqlParser_consume(character) {
    if (this.data[this.index] !== character) {
        throw __classPrivateFieldGet(this, _MysqlParser_instances, "m", _MysqlParser_createSyntaxError).call(this);
    }
    this.index++;
}, _MysqlParser_createSyntaxError = function _MysqlParser_createSyntaxError() {
    const character = JSON.stringify(this.data[this.index]) ?? 'EOF';
    return new SyntaxError(`Unexpected character ${character} at index ${this.index}`);
}, _MysqlParser_parseEnumBody = function _MysqlParser_parseEnumBody() {
    const enums = [];
    while (this.index < this.data.length && this.data[this.index] !== ')') {
        if (enums.length > 0) {
            __classPrivateFieldGet(this, _MysqlParser_instances, "m", _MysqlParser_consume).call(this, ',');
        }
        const value = __classPrivateFieldGet(this, _MysqlParser_instances, "m", _MysqlParser_parseEnumValue).call(this);
        enums.push(value);
    }
    return enums;
}, _MysqlParser_parseEnumValue = function _MysqlParser_parseEnumValue() {
    let value = '';
    __classPrivateFieldGet(this, _MysqlParser_instances, "m", _MysqlParser_consume).call(this, "'");
    while (this.index < this.data.length) {
        if (this.data[this.index] === "'") {
            this.index++;
            if (this.data[this.index] === "'") {
                value += this.data[this.index++];
            }
            else {
                break;
            }
        }
        else {
            value += this.data[this.index++];
        }
    }
    return value;
};
//# sourceMappingURL=mysql-parser.js.map
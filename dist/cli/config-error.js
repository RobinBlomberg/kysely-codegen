"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigError = void 0;
class ConfigError extends TypeError {
    constructor(error) {
        super(`Invalid value for option "${error.path}": ${error.message}`);
        this.name = ConfigError.name;
    }
}
exports.ConfigError = ConfigError;
//# sourceMappingURL=config-error.js.map
export class ConfigError extends TypeError {
  constructor(error: { message: string; path: (number | string)[] }) {
    super(`Invalid value for option "${error.path}": ${error.message}`);
    this.name = ConfigError.name;
  }
}

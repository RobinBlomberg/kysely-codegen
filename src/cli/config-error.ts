export class ConfigError extends TypeError {
  constructor(error: { message: string; path: PropertyKey[] }) {
    const path = error.path.map((segment) => String(segment)).join('.');
    super(`Invalid value for option "${path}": ${error.message}`);
    this.name = ConfigError.name;
  }
}

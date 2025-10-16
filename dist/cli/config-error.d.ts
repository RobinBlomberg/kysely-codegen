export declare class ConfigError extends TypeError {
    constructor(error: {
        message: string;
        path: PropertyKey[];
    });
}

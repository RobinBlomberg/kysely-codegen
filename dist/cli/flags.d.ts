type Flag = {
    default?: string;
    description: string;
    example?: string;
    examples?: string[];
    longName: string;
    shortName?: string;
    values?: readonly string[];
};
export declare const FLAGS: ({
    description: string;
    longName: string;
    example?: undefined;
    default?: undefined;
    values?: undefined;
    examples?: undefined;
    shortName?: undefined;
} | {
    description: string;
    example: string;
    longName: string;
    default?: undefined;
    values?: undefined;
    examples?: undefined;
    shortName?: undefined;
} | {
    default: string;
    description: string;
    longName: string;
    values: string[];
    example?: undefined;
    examples?: undefined;
    shortName?: undefined;
} | {
    description: string;
    longName: string;
    values: string[];
    example?: undefined;
    default?: undefined;
    examples?: undefined;
    shortName?: undefined;
} | {
    description: string;
    examples: string[];
    longName: string;
    example?: undefined;
    default?: undefined;
    values?: undefined;
    shortName?: undefined;
} | {
    description: string;
    longName: string;
    shortName: string;
    example?: undefined;
    default?: undefined;
    values?: undefined;
    examples?: undefined;
} | {
    default: string;
    description: string;
    longName: string;
    values: readonly ["debug", "info", "warn", "error", "silent"];
    example?: undefined;
    examples?: undefined;
    shortName?: undefined;
} | {
    default: string;
    description: string;
    longName: string;
    example?: undefined;
    values?: undefined;
    examples?: undefined;
    shortName?: undefined;
})[];
export declare const serializeFlags: (flags: Flag[]) => string;
export {};

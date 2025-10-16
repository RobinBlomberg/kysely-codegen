import type { Config } from './config';
/**
 * Creates a kysely-codegen command-line interface.
 */
export declare class Cli {
    #private;
    logLevel: "error" | "debug" | "silent" | "warn" | "info";
    generate(options: Config): Promise<string>;
    parseOptions(args: string[], options?: {
        config?: Config;
        silent?: boolean;
    }): Config;
    run(options?: {
        argv?: string[];
        config?: Config;
    }): Promise<string>;
}

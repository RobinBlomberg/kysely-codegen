import type { DialectName } from '../cli/config';
import type { Logger } from './logger/logger';
/**
 * @see https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html
 */
type ParseConnectionStringOptions = {
    connectionString: string;
    dialect?: DialectName;
    envFile?: string;
    logger?: Logger;
};
type ParsedConnectionString = {
    connectionString: string;
    dialect: DialectName;
};
/**
 * Parses a connection string URL or loads it from an environment file.
 * Upon success, it also returns which dialect was inferred from the connection string.
 */
export declare class ConnectionStringParser {
    #private;
    parse(options: ParseConnectionStringOptions): ParsedConnectionString;
}
export {};

import { Kysely } from 'kysely';
export declare const migrate: (connectionString: string) => Promise<Kysely<any>>;

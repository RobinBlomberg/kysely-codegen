import { Kysely } from 'kysely';
import { IntrospectorDialect } from './dialect';
export declare const addExtraColumn: (db: Kysely<any>, dialect?: IntrospectorDialect) => Promise<void>;
export declare const migrate: (dialect: IntrospectorDialect, connectionString: string) => Promise<Kysely<any>>;

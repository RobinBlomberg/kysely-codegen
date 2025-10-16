export type PostgresDB = {
    'pg_catalog.pg_namespace': {
        nspname: string;
        oid: number;
    };
    pg_enum: {
        enumlabel: string;
        enumtypid: number;
    };
    pg_type: {
        oid: number;
        typname: string;
        typnamespace: number;
    };
};

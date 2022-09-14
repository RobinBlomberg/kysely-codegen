export type PostgresDB = {
  pg_enum: {
    enumlabel: string;
    enumtypid: number;
  };
  pg_type: {
    oid: number;
    typname: string;
  };
};

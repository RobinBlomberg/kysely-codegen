export type MysqlDB = {
  'information_schema.COLUMNS': {
    COLUMN_NAME: string;
    COLUMN_TYPE: string;
    TABLE_NAME: string;
    TABLE_SCHEMA: string;
  };
  'information_schema.TABLES': {
    TABLE_COMMENT: string | null;
    TABLE_NAME: string;
    TABLE_SCHEMA: string;
  };
};

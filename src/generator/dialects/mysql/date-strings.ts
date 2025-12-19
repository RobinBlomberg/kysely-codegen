export const MYSQL_DATE_STRING_TYPES = [
  'date',
  'datetime',
  'timestamp',
] as const;

export type MysqlDateStringType = (typeof MYSQL_DATE_STRING_TYPES)[number];

export type MysqlDateStrings = boolean | MysqlDateStringType[];

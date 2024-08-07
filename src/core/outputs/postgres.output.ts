import type { ColumnType, JSONColumnType } from "kysely";
import type { IPostgresInterval } from "postgres-interval";

export type ArrayType<T> = ArrayTypeImpl<T> extends (infer U)[]
  ? U[]
  : ArrayTypeImpl<T>;

export type ArrayTypeImpl<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S[], I[], U[]>
  : T[];

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Interval = ColumnType<IPostgresInterval, IPostgresInterval | number | string, IPostgresInterval | number | string>;

export type Json = JsonValue;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Status = "CONFIRMED" | "UNCONFIRMED";

export type TestStatus = "BAR" | "FOO";

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface FooBar {
  array: string[] | null;
  childDomain: number | null;
  defaultedNullablePosInt: Generated<number | null>;
  defaultedRequiredPosInt: Generated<number>;
  /**
   * This is a comment on a column.
   *
   * It's nice, isn't it?
   */
  false: boolean;
  id: Generated<number>;
  interval1: Interval | null;
  interval2: Interval | null;
  json: Json | null;
  jsonTyped: JSONColumnType<{ foo: "bar" }>;
  nullablePosInt: number | null;
  overridden: "OVERRIDDEN";
  testDomainIsBool: boolean | null;
  timestamps: ArrayType<Timestamp> | null;
  true: boolean;
  userStatus: Status | null;
  userStatus2: TestStatus | null;
}

export interface DB {
  fooBar: FooBar;
}

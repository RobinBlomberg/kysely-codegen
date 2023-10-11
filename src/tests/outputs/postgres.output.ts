import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Status = "CONFIRMED" | "UNCONFIRMED";

export type TestStatus = "BAR" | "FOO";

export interface FooBar {
  false: boolean;
  true: boolean;
  id: Generated<number>;
  userStatus: Status | null;
  userStatus2: TestStatus | null;
  array: string[] | null;
  nullablePosInt: number | null;
  defaultedNullablePosInt: Generated<number | null>;
  defaultedRequiredPosInt: Generated<number>;
  childDomain: number | null;
  testDomainIsBool: boolean | null;
}

export interface DB {
  fooBar: FooBar;
}

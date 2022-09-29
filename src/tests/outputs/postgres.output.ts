import { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Status = "FOO" | "BAR";

export type Status2 = "CONFIRMED" | "UNCONFIRMED";

export interface Users {
  id: Generated<number>;
  userStatus: Status | null;
  userStatus2: Status2 | null;
}

export interface DB {
  users: Users;
}

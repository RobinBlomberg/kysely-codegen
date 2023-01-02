import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface FooBar {
  false: number;
  true: number;
  id: Generated<number>;
  userStatus: string | null;
}

export interface DB {
  fooBar: FooBar;
}

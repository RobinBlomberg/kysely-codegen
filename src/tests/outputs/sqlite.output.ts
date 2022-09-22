export interface Users {
  id: string | null;
  userStatus: string | null;
}

export interface DB {
  users: Users;
}

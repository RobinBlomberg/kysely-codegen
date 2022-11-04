export interface UserTest {
  id: string | null;
  userStatus: string | null;
}

export interface DB {
  userTest: UserTest;
}

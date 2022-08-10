let depth = 0;

export type Test = () => Promise<void> | void;

export const describe = async (name: string, test: Test) => {
  depth++;
  await test();
  depth--;

  if (!depth) {
    console.log('All tests passed.');
  }
};

export const it = async (name: string, test: Test) => {
  depth++;
  await test();
  depth--;
};

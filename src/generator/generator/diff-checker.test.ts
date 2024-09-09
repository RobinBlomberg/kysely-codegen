import { strictEqual } from 'assert';
import { test } from 'vitest';
import { DiffChecker } from './diff-checker';

test(DiffChecker.name, () => {
  strictEqual(
    new DiffChecker().diff('Foo\nBar\nBaz', 'Foo\nBar\nBaz'),
    undefined,
  );
  strictEqual(
    new DiffChecker().diff('Foo\nBar\nBaz', 'Foo\nQux\nBaz'),
    '@@ -1,3 +1,3 @@\n Foo\n-Bar\n+Qux\n Baz\n',
  );
});

import { strictEqual } from 'node:assert';
import { DiffChecker } from './diff-checker';

test(DiffChecker.name, () => {
  strictEqual(
    new DiffChecker().diff('Foo\nBar\nBaz', 'Foo\nBar\nBaz'),
    undefined,
  );
  strictEqual(
    new DiffChecker().diff('Foo\nBar\nBaz', 'Foo\nQux\nBaz'),
    ' Foo\n-Bar\n+Qux\n Baz\n',
  );
});

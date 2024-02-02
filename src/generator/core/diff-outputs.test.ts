import { strictEqual } from 'assert';
import { test } from 'vitest';
import { diffOutputs } from './diff-outputs.js';

test('diffOutputs', () => {
  strictEqual(diffOutputs('Foo\nBar\nBaz', 'Foo\nBar\nBaz'), undefined);
  strictEqual(
    diffOutputs('Foo\nBar\nBaz', 'Foo\nQux\nBaz'),
    '@@ -1,3 +1,3 @@\n Foo\n-Bar\n+Qux\n Baz\n',
  );
});

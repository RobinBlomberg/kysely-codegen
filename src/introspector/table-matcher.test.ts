import { strictEqual } from 'assert';
import { TableMatcher } from './table-matcher';

describe(TableMatcher.name, () => {
  it('should match tables without schemas', () => {
    strictEqual(new TableMatcher('foo').match(undefined, 'foo'), true);
    strictEqual(new TableMatcher('.foo').match(undefined, 'foo'), false);
    strictEqual(new TableMatcher('*.foo').match(undefined, 'foo'), true);
    strictEqual(new TableMatcher('public.foo').match(undefined, 'foo'), false);
  });

  it('should match tables with schemas', () => {
    strictEqual(new TableMatcher('foo').match('public', 'foo'), true);
    strictEqual(new TableMatcher('.foo').match('public', 'foo'), false);
    strictEqual(new TableMatcher('*.foo').match('public', 'foo'), true);
    strictEqual(new TableMatcher('public.foo').match('public', 'foo'), true);
  });

  it('should be able to match tables containing "." without schemas', () => {
    strictEqual(new TableMatcher('foo.bar').match(undefined, 'foo.bar'), false);
    strictEqual(
      new TableMatcher('.foo.bar').match(undefined, 'foo.bar'),
      false,
    );
    strictEqual(
      new TableMatcher('*.foo.bar').match(undefined, 'foo.bar'),
      true,
    );
    strictEqual(
      new TableMatcher('public.foo.bar').match(undefined, 'foo.bar'),
      false,
    );
  });

  it('should be able to match tables containing "." with schemas', () => {
    strictEqual(new TableMatcher('foo.bar').match('public', 'foo.bar'), false);
    strictEqual(new TableMatcher('.foo.bar').match('public', 'foo.bar'), false);
    strictEqual(new TableMatcher('*.foo.bar').match('public', 'foo.bar'), true);
    strictEqual(
      new TableMatcher('public.foo.bar').match('public', 'foo.bar'),
      true,
    );
  });

  it('should match case-insensitively', () => {
    strictEqual(new TableMatcher('FoO_bAr').match(undefined, 'foo_bar'), true);
  });

  it('should support logical OR', () => {
    strictEqual(new TableMatcher('(foo|bar)').match(undefined, 'foo'), true);
    strictEqual(new TableMatcher('(foo|bar)').match(undefined, 'bar'), true);
    strictEqual(new TableMatcher('(foo|bar)').match(undefined, 'baz'), false);
    strictEqual(
      new TableMatcher('foo_(bar|baz)').match(undefined, 'foo_bar'),
      true,
    );
    strictEqual(
      new TableMatcher('foo_(bar|baz)').match(undefined, 'foo_baz'),
      true,
    );
    strictEqual(
      new TableMatcher('foo_(bar|baz)').match(undefined, 'foo_qux'),
      false,
    );
  });

  it('should support simple brace expansion', () => {
    strictEqual(new TableMatcher('foo_{1,2}').match(undefined, 'foo_1'), true);
    strictEqual(new TableMatcher('foo_{1,2}').match(undefined, 'foo_2'), true);
    strictEqual(new TableMatcher('foo_{1,2}').match(undefined, 'foo_3'), false);
  });

  it('should support negation', () => {
    strictEqual(
      new TableMatcher('!foo_(bar|baz)').match(undefined, 'foo_bar'),
      false,
    );
    strictEqual(
      new TableMatcher('!foo_(bar|baz)').match(undefined, 'foo_baz'),
      false,
    );
    strictEqual(
      new TableMatcher('!foo_(bar|baz)').match(undefined, 'foo_qux'),
      true,
    );
  });
});

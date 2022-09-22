import { strictEqual } from 'assert';
import { TableMatcher } from '../table-matcher';
import { describe, it } from './test.utils';

export const testTableMatcher = () => {
  void describe('table-matcher', () => {
    void it('should match tables without schemas', () => {
      strictEqual(new TableMatcher('foo').match(undefined, 'foo'), true);
      strictEqual(new TableMatcher('.foo').match(undefined, 'foo'), false);
      strictEqual(new TableMatcher('*.foo').match(undefined, 'foo'), true);
      strictEqual(
        new TableMatcher('public.foo').match(undefined, 'foo'),
        false,
      );
    });

    void it('should match tables with schemas', () => {
      strictEqual(new TableMatcher('foo').match('public', 'foo'), true);
      strictEqual(new TableMatcher('.foo').match('public', 'foo'), false);
      strictEqual(new TableMatcher('*.foo').match('public', 'foo'), true);
      strictEqual(new TableMatcher('public.foo').match('public', 'foo'), true);
    });

    void it('should be able to match tables containing "." without schemas', () => {
      strictEqual(
        new TableMatcher('foo.bar').match(undefined, 'foo.bar'),
        false,
      );
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

    void it('should be able to match tables containing "." with schemas', () => {
      strictEqual(
        new TableMatcher('foo.bar').match('public', 'foo.bar'),
        false,
      );
      strictEqual(
        new TableMatcher('.foo.bar').match('public', 'foo.bar'),
        false,
      );
      strictEqual(
        new TableMatcher('*.foo.bar').match('public', 'foo.bar'),
        true,
      );
      strictEqual(
        new TableMatcher('public.foo.bar').match('public', 'foo.bar'),
        true,
      );
    });

    void it('should match case-insensitively', () => {
      strictEqual(
        new TableMatcher('FoO_bAr').match(undefined, 'foo_bar'),
        true,
      );
    });

    void it('should support logical OR', () => {
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

    void it('should support simple brace expansion', () => {
      strictEqual(
        new TableMatcher('foo_{1,2}').match(undefined, 'foo_1'),
        true,
      );
      strictEqual(
        new TableMatcher('foo_{1,2}').match(undefined, 'foo_2'),
        true,
      );
      strictEqual(
        new TableMatcher('foo_{1,2}').match(undefined, 'foo_3'),
        false,
      );
    });

    void it('should support negation', () => {
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
};

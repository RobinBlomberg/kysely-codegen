import { strictEqual as equal } from 'assert';
import { it } from 'vitest';
import { matchTableName } from './match-table-name.js';

it('should match tables without schemas', () => {
  equal(matchTableName(null, 'foo', 'foo'), true);
  equal(matchTableName(null, 'foo', '.foo'), false);
  equal(matchTableName(null, 'foo', '*.foo'), true);
  equal(matchTableName(null, 'foo', 'public.foo'), false);
});

it('should match tables with schemas', () => {
  equal(matchTableName('public', 'foo', 'foo'), true);
  equal(matchTableName('public', 'foo', '.foo'), false);
  equal(matchTableName('public', 'foo', '*.foo'), true);
  equal(matchTableName('public', 'foo', 'public.foo'), true);
});

it('should be able to match tables containing "." without schemas', () => {
  equal(matchTableName(null, 'foo.bar', 'foo.bar'), false);
  equal(matchTableName(null, 'foo.bar', '.foo.bar'), false);
  equal(matchTableName(null, 'foo.bar', '*.foo.bar'), true);
  equal(matchTableName(null, 'foo.bar', 'public.foo.bar'), false);
});

it('should be able to match tables containing "." with schemas', () => {
  equal(matchTableName('public', 'foo.bar', 'foo.bar'), false);
  equal(matchTableName('public', 'foo.bar', '.foo.bar'), false);
  equal(matchTableName('public', 'foo.bar', '*.foo.bar'), true);
  equal(matchTableName('public', 'foo.bar', 'public.foo.bar'), true);
});

it('should match case-insensitively', () => {
  equal(matchTableName(null, 'foo_bar', 'FoO_bAr'), true);
});

it('should support logical OR', () => {
  equal(matchTableName(null, 'foo', '(foo|bar)'), true);
  equal(matchTableName(null, 'bar', '(foo|bar)'), true);
  equal(matchTableName(null, 'baz', '(foo|bar)'), false);
  equal(matchTableName(null, 'foo_bar', 'foo_(bar|baz)'), true);
  equal(matchTableName(null, 'foo_baz', 'foo_(bar|baz)'), true);
  equal(matchTableName(null, 'foo_qux', 'foo_(bar|baz)'), false);
  equal(matchTableName(null, 'table1', 'table(1|3)'), true);
});

it('should support simple brace expansion', () => {
  equal(matchTableName(null, 'foo_1', 'foo_{1,2}'), true);
  equal(matchTableName(null, 'foo_2', 'foo_{1,2}'), true);
  equal(matchTableName(null, 'foo_3', 'foo_{1,2}'), false);
});

it('should support negation', () => {
  equal(matchTableName(null, 'foo_bar', '!foo_(bar|baz)'), false);
  equal(matchTableName(null, 'foo_baz', '!foo_(bar|baz)'), false);
  equal(matchTableName(null, 'foo_qux', '!foo_(bar|baz)'), true);
});

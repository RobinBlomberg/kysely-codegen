import { deepStrictEqual } from 'assert';
import { SymbolCollection, SymbolType } from '../collections';
import { IdentifierNode } from '../nodes';
import { describe } from './test.utils';

export const testSymbolCollection = () => {
  void describe('symbol-collection', () => {
    const symbols = new SymbolCollection();
    symbols.set('foo-bar', {
      node: new IdentifierNode('FooBar'),
      type: SymbolType.DEFINITION,
    });
    deepStrictEqual(symbols.symbolNames, { 'foo-bar': 'FooBar' });
  });
};

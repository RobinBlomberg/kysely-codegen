import { deepStrictEqual } from 'assert';
import { IdentifierNode } from '../ast';
import { describe } from '../test.utils';
import { SymbolCollection, SymbolNode, SymbolType } from './symbol-collection';

export const testSymbolCollection = () => {
  void describe('symbol-collection', () => {
    const symbols = new SymbolCollection();
    const symbol: SymbolNode = {
      node: new IdentifierNode('FooBar'),
      type: SymbolType.DEFINITION,
    };

    symbols.set('foo-bar', symbol);
    symbols.set('foo__bar__', symbol);
    symbols.set('__foo__bar__', symbol);
    symbols.set('Foo, Bar!', symbol);
    symbols.set('Foo$Bar', symbol);

    deepStrictEqual(symbols.symbolNames, {
      'foo-bar': 'FooBar',
      foo__bar__: 'FooBar2',
      __foo__bar__: '_FooBar',
      'Foo, Bar!': 'FooBar3',
      Foo$Bar: 'Foo$Bar',
    });
  });
};

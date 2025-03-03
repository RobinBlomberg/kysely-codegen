import { deepStrictEqual } from 'assert';
import { IdentifierNode } from '../ast/identifier-node';
import type { SymbolNode } from './symbol-collection';
import { SymbolCollection } from './symbol-collection';

test(SymbolCollection.name, () => {
  const symbols = new SymbolCollection();
  const symbol: SymbolNode = {
    node: new IdentifierNode('FooBar'),
    type: 'Definition',
  };

  symbols.set('foo-bar', symbol);
  symbols.set('foo__bar__', symbol);
  symbols.set('__foo__bar__', symbol);
  symbols.set('Foo, Bar!', symbol);
  symbols.set('Foo$Bar', symbol);
  symbols.set('0x123', symbol);
  symbols.set('!', symbol);
  symbols.set('"', symbol);

  deepStrictEqual(symbols.symbolNames, {
    'foo-bar': 'FooBar',
    foo__bar__: 'FooBar2',
    __foo__bar__: '_FooBar',
    'Foo, Bar!': 'FooBar3',
    Foo$Bar: 'Foo$Bar',
    '0x123': '_0x123',
    '!': '_',
    '"': '_2',
  });
});

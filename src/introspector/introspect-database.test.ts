import { expect, test } from 'vitest';
import { introspectDatabase } from './introspect-database.js';

test('introspectDatabase', async () => {
  const schema = await introspectDatabase({
    db: 'postgres://qwe:qwe@localhost:5433/qwe',
    dialect: 'postgres',
  });
  expect(schema instanceof Object).toBe(true);
});

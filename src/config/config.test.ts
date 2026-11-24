import { strictEqual } from 'node:assert';
import { PostgresDialect } from '../generator/dialects/postgres/postgres-dialect';
import { TypeScriptSerializer } from '../generator/generator/serializer';
import { DatabaseMetadata } from '../introspector/metadata/database-metadata';
import { configSchema } from './config';

describe('configSchema', () => {
  it('should accept a serializer instance without detaching its methods', () => {
    const serializer = new TypeScriptSerializer();
    const config = configSchema.parse({ serializer });
    const output = config.serializer?.serializeFile(
      new DatabaseMetadata({
        tables: [
          { columns: [{ dataType: 'text', name: 'name' }], name: 'users' },
        ],
      }),
      new PostgresDialect(),
    );

    strictEqual(output?.includes('export interface Users {'), true);
    strictEqual(config.serializer, serializer);
  });

  it('should reject a serializer without a serializeFile method', () => {
    strictEqual(configSchema.safeParse({ serializer: {} }).success, false);
  });
});

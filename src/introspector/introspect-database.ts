import { defaultAdapters, getAdapter } from './adapters.js';
import type { IntrospectDatabaseOptions } from './types.js';

export const introspectDatabase = async (
  options: IntrospectDatabaseOptions,
) => {
  const adapters = options.adapters ?? defaultAdapters;
  const adapter = getAdapter(options.dialect, adapters);
  const db =
    typeof options.db === 'string'
      ? await adapter.connect(options.db)
      : options.db;
  const schema = await adapter.introspect(db);
  await db.destroy().catch();
  return schema;
};

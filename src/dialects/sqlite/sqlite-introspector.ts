import { EnumCollection } from '../../generator/core/enum-collection';
import { DatabaseMetadata } from '../../generator/core/metadata/database-metadata';
import type { IntrospectOptions } from '../../introspector/introspector';
import { Introspector } from '../../introspector/introspector';

export class SqliteIntrospector extends Introspector<any> {
  async introspect(options: IntrospectOptions<any>) {
    const tables = await this.getTables(options);
    const enums = new EnumCollection();
    return new DatabaseMetadata(tables, enums);
  }
}

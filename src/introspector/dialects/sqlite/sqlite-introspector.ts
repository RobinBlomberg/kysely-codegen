import { EnumCollection } from '../../enum-collection';
import type { IntrospectOptions } from '../../introspector';
import { Introspector } from '../../introspector';
import { DatabaseMetadata } from '../../metadata/database-metadata';

export class SqliteIntrospector extends Introspector<any> {
  async introspect(options: IntrospectOptions<any>) {
    const tables = await this.getTables(options);
    const enums = new EnumCollection();
    return new DatabaseMetadata({ enums, tables });
  }
}

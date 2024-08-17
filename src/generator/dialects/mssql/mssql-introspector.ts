import { EnumCollection } from '../../../introspector/enum-collection';
import type { IntrospectOptions } from '../../../introspector/introspector';
import { Introspector } from '../../../introspector/introspector';
import { DatabaseMetadata } from '../../../introspector/metadata/database-metadata';

export class MssqlIntrospector extends Introspector<any> {
  async introspect(options: IntrospectOptions<any>) {
    const tables = await this.getTables(options);
    const enums = new EnumCollection();
    return new DatabaseMetadata(tables, enums);
  }
}

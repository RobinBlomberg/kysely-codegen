import { DatabaseMetadata, EnumCollection } from '../../core';
import { IntrospectOptions, Introspector } from '../../introspector';

export class SqliteIntrospector extends Introspector<any> {
  async introspect(options: IntrospectOptions<any>) {
    const tables = await this.getTables(options);
    const enums = new EnumCollection();
    return new DatabaseMetadata(tables, enums);
  }
}

import { EnumCollection } from '../../collections';
import { IntrospectOptions, Introspector } from '../../introspector';
import { DatabaseMetadata } from '../../metadata';

export class SqliteIntrospector extends Introspector<never> {
  async introspect(options: IntrospectOptions<never>) {
    const tables = await this.getTables(options);
    const enums = new EnumCollection();
    return new DatabaseMetadata(tables, enums);
  }
}

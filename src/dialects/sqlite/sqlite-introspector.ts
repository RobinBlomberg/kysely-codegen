import { EnumCollection } from '../../enum-collection';
import { IntrospectionOptions, Introspector } from '../../introspector';
import { DatabaseMetadata } from '../../metadata';

export class SqliteIntrospector extends Introspector<never> {
  async introspect(options: IntrospectionOptions) {
    const db = await this.connect(options);
    const tables = await this.getTables(db, options);

    await db.destroy();

    const enums = new EnumCollection();
    return new DatabaseMetadata(tables, enums);
  }
}

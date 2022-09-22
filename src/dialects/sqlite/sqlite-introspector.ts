import { EnumCollection } from '../../collections';
import { IntrospectOptions, Introspector } from '../../introspector';
import { DatabaseMetadata } from '../../metadata';

export class SqliteIntrospector extends Introspector<never> {
  async introspect(options: IntrospectOptions) {
    const db = await this.connect(options);
    const tables = await this.getTables(db, options);

    await db.destroy();

    const enums = new EnumCollection();
    return new DatabaseMetadata(tables, enums);
  }
}

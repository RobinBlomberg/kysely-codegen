import { Kysely, sql, TableMetadata } from 'kysely';
import { EnumCollection } from '../../enum-collection';
import type { IntrospectOptions } from '../../introspector';
import { Introspector } from '../../introspector';
import { DatabaseMetadata } from '../../metadata/database-metadata';

interface TableInfo {
  cid: number;
  name: string;
  type: string;
  notnull: 0 | 1;
  pk: number;
}

export class SqliteIntrospector extends Introspector<any> {
  async introspect(options: IntrospectOptions<any>) {
    const tables = await this.sqliteAutoincrement(
      options.db,
      await this.getTables(options),
    );
    const enums = new EnumCollection();
    return new DatabaseMetadata({ enums, tables });
  }

  // https://www.sqlite.org/autoinc.html
  protected sqliteAutoincrement(db: Kysely<any>, tables: TableMetadata[]) {
    return Promise.all(
      tables.map(async (t) => {
        if (t.columns.some((t) => t.isAutoIncrementing)) {
          return t;
        }
        const { rows } =
          await sql<TableInfo>`PRAGMA table_info(${sql.id(t.name)})`.execute(
            db,
          );
        const pkCols = rows.filter(
          (r) => r.type.toLowerCase() === 'integer' && r.pk > 0,
        );
        if (!pkCols[0] || pkCols.length > 1) {
          return t;
        }
        const pkCol = pkCols[0];
        return {
          ...t,
          columns: t.columns.map((t) => {
            return t.name === pkCol.name
              ? { ...t, isAutoIncrementing: true }
              : t;
          }),
        };
      }),
    );
  }
}

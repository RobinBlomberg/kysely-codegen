import type { CreateKyselyDialectOptions } from '../../dialect';
import { IntrospectorDialect } from '../../dialect';
import { ClickHouseIntrospector } from './clickhouse-introspector';

export class ClickHouseIntrospectorDialect extends IntrospectorDialect {
  override readonly introspector: ClickHouseIntrospector;

  constructor() {
    super();

    this.introspector = new ClickHouseIntrospector();
  }

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    // Import @founderpath/kysely-clickhouse dynamically
    const { ClickhouseDialect: KyselyClickHouseDialect } = await import(
      '@founderpath/kysely-clickhouse'
    );

    return new KyselyClickHouseDialect({
      options: { url: options.connectionString },
    });
  }
}

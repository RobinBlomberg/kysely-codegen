import type { CreateKyselyDialectOptions } from '../../dialect';
import { IntrospectorDialect } from '../../dialect';
import { ClickHouseIntrospector } from './clickhouse-introspector';

export class ClickHouseIntrospectorDialect extends IntrospectorDialect {
  override readonly introspector: ClickHouseIntrospector;

  constructor() {
    super();

    this.introspector = new ClickHouseIntrospector();
  }

  private parseConnectionString(connectionString: string) {
    const url = new URL(connectionString);
    return {
      url: url.origin,
      username: url.searchParams.get('username') ?? undefined,
      password: url.searchParams.get('password') ?? undefined,
    };
  }

  async createKyselyDialect(options: CreateKyselyDialectOptions) {
    // Import @founderpath/kysely-clickhouse dynamically
    const { ClickhouseDialect: KyselyClickHouseDialect } =
      await import('@founderpath/kysely-clickhouse');

    const { url, username, password } = this.parseConnectionString(options.connectionString);
    return new KyselyClickHouseDialect({ options: { url, username, password } });
  }
}

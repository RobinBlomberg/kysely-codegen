import type { GeneratorDialect } from '../../dialect';

import { ClickHouseIntrospectorDialect } from '../../../introspector/dialects/clickhouse/clickhouse-dialect';
import { ClickhouseAdapter } from './clickhouse-adapter';

export class ClickhouseDialect
  extends ClickHouseIntrospectorDialect
  implements GeneratorDialect
{
  readonly adapter = new ClickhouseAdapter();
}

import { testCli } from './cli.test';
import { testConnectionStringParser } from './connection-string-parser.test';
import { testE2E } from './e2e.test';
import { testSerializer } from './serializer.test';
import { testTableMatcher } from './table-matcher.test';
import { testTransformer } from './transformer.test';

(async () => {
  testCli();
  testConnectionStringParser();
  testTableMatcher();
  testTransformer();
  testSerializer();
  await testE2E();
})();

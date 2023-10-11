import { testCli } from './cli/cli.test';
import { testConnectionStringParser } from './core/connection-string-parser.test';
import { testDiffChecker } from './core/diff-checker.test';
import { testE2E } from './core/e2e.test';
import { testTableMatcher } from './introspector/table-matcher.test';
import { testSerializer } from './serializer/serializer.test';
import { testSymbolCollection } from './transformer/symbol-collection.test';
import { testTransformer } from './transformer/transformer.test';

(async () => {
  testCli();
  testConnectionStringParser();
  testDiffChecker();
  testTableMatcher();
  testTransformer();
  testSerializer();
  testSymbolCollection();
  await testE2E();
})();

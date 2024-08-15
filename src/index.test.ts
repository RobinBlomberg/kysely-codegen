import { testCli } from './generator/cli/cli.test';
import { testConnectionStringParser } from './generator/core/connection-string-parser.test';
import { testDiffChecker } from './generator/core/diff-checker.test';
import { testE2E } from './generator/core/e2e.test';
import { testSerializer } from './generator/serializer/serializer.test';
import { testSymbolCollection } from './generator/transformer/symbol-collection.test';
import { testTransformer } from './generator/transformer/transformer.test';
import { testTableMatcher } from './introspector/table-matcher.test';

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

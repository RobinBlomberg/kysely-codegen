import { singular } from 'pluralize';
import { addSingularizationRules } from './add-singularization-rules';

test(addSingularizationRules.name, () => {
  addSingularizationRules({
    '/(bacch)(?:us|i)$/i': '$1us',
    beeves: 'beef',
  });

  expect(singular('bacchus')).toStrictEqual('bacchus');
  expect(singular('bacchi')).toStrictEqual('bacchus');
  expect(singular('beeves')).toStrictEqual('beef');
});

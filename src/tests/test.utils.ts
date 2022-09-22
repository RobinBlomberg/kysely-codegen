import { Logger } from '../logger';

let depth = 0;
let passed = 0;
let skipped = 0;
let total = 0;

export type Test = () => Promise<void> | void;

export const describe = async (name: string, test: Test) => {
  const logger = new Logger();

  if (!depth) {
    logger.info('Running tests...');
  }

  depth++;
  await test();
  depth--;

  if (!depth) {
    logger.success(`${passed}/${total} test${total === 1 ? '' : 's'} passed`);

    total = 0;

    if (skipped) {
      logger.info(`${skipped} test${skipped === 1 ? '' : 's'} skipped`);
      skipped = 0;
    }

    logger.log('');
  }
};

export const it = async (name: string, test: Test) => {
  depth++;
  passed++;
  total++;
  await test();
  depth--;
};

export const xit = (_name: string, _test: Test) => {
  skipped++;
};

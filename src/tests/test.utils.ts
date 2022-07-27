import chalk from 'chalk';

type Test = () => Promise<void> | void;

const nameStack: string[] = [];
let count = 0;
let startTime = 0;

const log = (string: string) => {
  console.info(`[${chalk.cyan('TEST')}] ${string}`);
};

export const describe = async (name: string, test: Test) => {
  if (!nameStack.length) {
    log(chalk.blue('• Running tests...'));
    count = 0;
    startTime = performance.now();
  }

  nameStack.push(name);
  await test();
  nameStack.pop();

  if (!nameStack.length) {
    const elapsedTime = `${Math.round(performance.now() - startTime)} ms`;
    log(chalk.green(`✓ Finished ${count} tests in ${elapsedTime}.`));
  }
};

export const it = async (name: string, test: Test) => {
  nameStack.push(name);
  log(`  ${nameStack.map((n) => chalk.gray(n)).join(chalk.cyan(' → '))}`);
  await test();
  nameStack.pop();
  count++;
};

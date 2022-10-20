import { deepStrictEqual } from 'assert';
import { Cli, CliOptions } from '../cli';
import { DEFAULT_LOG_LEVEL, DEFAULT_OUT_FILE, DEFAULT_URL } from '../constants';
import { LogLevel } from '../enums';
import { describe, it } from './test.utils';

export const testCli = () => {
  const cli = new Cli();

  const DEFAULT_CLI_OPTIONS: CliOptions = {
    camelCase: false,
    dialectName: undefined,
    excludePattern: undefined,
    includePattern: undefined,
    logLevel: DEFAULT_LOG_LEVEL,
    outFile: DEFAULT_OUT_FILE,
    print: false,
    url: DEFAULT_URL,
  };

  void describe('cli', () => {
    void it('should parse options correctly', () => {
      const assert = (args: string[], expectedOptions: Partial<CliOptions>) => {
        const cliOptions = cli.parseOptions(args, { silent: true });

        deepStrictEqual(cliOptions, {
          ...DEFAULT_CLI_OPTIONS,
          ...expectedOptions,
        });
      };

      assert(['--camel-case'], { camelCase: true });
      assert(['--dialect=mysql'], { dialectName: 'mysql' });
      assert(['--exclude-pattern=public._*'], { excludePattern: 'public._*' });
      assert(['--help'], {});
      assert(['-h'], {});
      assert(['--include-pattern=public._*'], { includePattern: 'public._*' });
      assert(['--log-level=debug'], { logLevel: LogLevel.DEBUG });
      assert(['--out-file=./db.ts'], { outFile: './db.ts' });
      assert(['--print'], { outFile: undefined, print: true });
      assert(['--url=postgres://u:p@s/d'], { url: 'postgres://u:p@s/d' });
    });
  });
};

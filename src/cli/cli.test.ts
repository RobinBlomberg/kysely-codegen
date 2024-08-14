import { deepStrictEqual } from 'assert';
import { LogLevel } from '../core';
import { DEFAULT_NUMERIC_PARSER } from '../dialects/postgres/numeric-parser';
import { describe, it } from '../test.utils';
import type { CliOptions } from './cli';
import { Cli } from './cli';
import { DEFAULT_LOG_LEVEL, DEFAULT_OUT_FILE, DEFAULT_URL } from './constants';

export const testCli = () => {
  const cli = new Cli();

  const DEFAULT_CLI_OPTIONS: CliOptions = {
    camelCase: false,
    dialectName: undefined,
    domains: false,
    envFile: undefined,
    excludePattern: undefined,
    includePattern: undefined,
    logLevel: DEFAULT_LOG_LEVEL,
    numericParser: DEFAULT_NUMERIC_PARSER,
    outFile: DEFAULT_OUT_FILE,
    overrides: undefined,
    print: false,
    runtimeEnums: false,
    schema: undefined,
    singular: false,
    typeOnlyImports: true,
    url: DEFAULT_URL,
    verify: false,
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
      assert(['--domains'], { domains: true });
      assert(['--exclude-pattern=public._*'], { excludePattern: 'public._*' });
      assert(['--help'], {});
      assert(['-h'], {});
      assert(['--include-pattern=public._*'], { includePattern: 'public._*' });
      assert(['--log-level=debug'], { logLevel: LogLevel.DEBUG });
      assert(['--no-domains'], { domains: false });
      assert(['--no-type-only-imports'], { typeOnlyImports: false });
      assert(['--out-file=./db.ts'], { outFile: './db.ts' });
      assert(
        [`--overrides={"columns":{"table.override":"{ foo: \\"bar\\" }"}}`],
        { overrides: { columns: { 'table.override': '{ foo: "bar" }' } } },
      );
      assert(['--print'], { outFile: undefined, print: true });
      assert(['--schema=foo'], { schema: 'foo' });
      assert(['--singular'], { singular: true });
      assert(['--type-only-imports'], { typeOnlyImports: true });
      assert(['--type-only-imports=false'], { typeOnlyImports: false });
      assert(['--type-only-imports=true'], { typeOnlyImports: true });
      assert(['--url=postgres://u:p@s/d'], { url: 'postgres://u:p@s/d' });
      assert(['--verify'], { verify: true });
      assert(['--verify=false'], { verify: false });
      assert(['--verify=true'], { verify: true });
    });
  });
};

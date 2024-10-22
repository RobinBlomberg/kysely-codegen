import { deepStrictEqual } from 'assert';
import { execa } from 'execa';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import packageJson from '../../package.json';
import { LogLevel } from '../generator/logger/log-level';
import { DateParser } from '../introspector/dialects/postgres/date-parser';
import type { CliGenerateOptions } from './cli';
import { Cli } from './cli';
import { ConfigError } from './config-error';
import { DEFAULT_OUT_FILE } from './constants';

describe(Cli.name, () => {
  const cli = new Cli();

  const DEFAULT_CLI_OPTIONS: CliGenerateOptions = {
    outFile: DEFAULT_OUT_FILE,
    url: 'postgres://user:password@localhost:5433/database',
  };

  it('should be able to start the CLI', async () => {
    await execa`pnpm build`;
    const binPath = join(process.cwd(), packageJson.bin['kysely-codegen']);
    const output = await execa`node ${binPath} --help`.then((a) => a.stdout);
    deepStrictEqual(output.includes('--help, -h'), true);
  });

  it('should throw an error if the config has an invalid schema', () => {
    const assert = (
      config: any,
      message: string,
      path = [Object.keys(config)[0]!],
    ) => {
      expect(() => cli.parseOptions([], { config })).toThrow(
        new ConfigError({ message, path }),
      );
    };

    assert({ camelCase: 'true' }, 'Expected boolean, received string');
    assert(
      { dateParser: 'timestamps' },
      "Invalid enum value. Expected 'string' | 'timestamp', received 'timestamps'",
    );
    assert(
      { dialectName: 'sqlite3' },
      "Invalid enum value. Expected 'bun-sqlite' | 'kysely-bun-sqlite' | 'libsql' | 'mssql' | 'mysql' | 'postgres' | 'sqlite' | 'worker-bun-sqlite', received 'sqlite3'",
    );
    assert({ domains: 'true' }, 'Expected boolean, received string');
    assert({ envFile: null }, 'Expected string, received null');
    assert({ excludePattern: null }, 'Expected string, received null');
    assert({ includePattern: null }, 'Expected string, received null');
    assert(
      { logLevel: 0 },
      "Invalid enum value. Expected 'silent' | 'info' | 'warn' | 'error' | 'debug', received '0'",
    );
    assert(
      { numericParser: 'numbers' },
      "Invalid enum value. Expected 'number' | 'number-or-string' | 'string', received 'numbers'",
    );
    assert({ outFile: false }, 'Expected string, received boolean');
    assert({ overrides: { columns: [] } }, 'Expected object, received array', [
      'overrides',
      'columns',
    ]);
    assert({ partitions: 'true' }, 'Expected boolean, received string');
    assert({ print: 'true' }, 'Expected boolean, received string');
    assert({ runtimeEnums: 'true' }, 'Expected boolean, received string');
    assert(
      { runtimeEnumsStyle: 'enums' },
      "Invalid enum value. Expected 'pascal-case' | 'screaming-snake-case', received 'enums'",
    );
    assert({ schemas: 'public' }, 'Expected array, received string');
    assert({ singular: 'true' }, 'Expected boolean, received string');
    assert({ typeOnlyImports: 'true' }, 'Expected boolean, received string');
    assert({ url: null }, 'Expected string, received null');
    assert({ verify: 'true' }, 'Expected boolean, received string');
  });

  it('should parse options correctly', () => {
    const assert = (
      args: string[],
      expectedOptions: Partial<CliGenerateOptions>,
    ) => {
      const cliOptions = cli.parseOptions(args, { silent: true });

      deepStrictEqual(cliOptions, {
        ...DEFAULT_CLI_OPTIONS,
        ...expectedOptions,
      });
    };

    assert(['--camel-case'], { camelCase: true });
    assert(['--date-parser=timestamp'], { dateParser: DateParser.TIMESTAMP });
    assert(['--date-parser=string'], { dateParser: DateParser.STRING });
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
    assert(['--schema=foo'], { schemas: ['foo'] });
    assert(['--schema=foo', '--schema=bar'], { schemas: ['foo', 'bar'] });
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

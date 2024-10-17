import { deepStrictEqual } from 'assert';
import { execa } from 'execa';
import { join } from 'path';
import { describe, it } from 'vitest';
import packageJson from '../../package.json';
import { LogLevel } from '../generator/logger/log-level';
import {
  DateParser,
  DEFAULT_DATE_PARSER,
} from '../introspector/dialects/postgres/date-parser';
import { DEFAULT_NUMERIC_PARSER } from '../introspector/dialects/postgres/numeric-parser';
import type { CliOptions } from './cli';
import { Cli } from './cli';
import { DEFAULT_LOG_LEVEL, DEFAULT_OUT_FILE, DEFAULT_URL } from './constants';

describe(Cli.name, () => {
  const cli = new Cli();

  const DEFAULT_CLI_OPTIONS: CliOptions = {
    camelCase: false,
    dateParser: DEFAULT_DATE_PARSER,
    dialectName: undefined,
    domains: false,
    envFile: undefined,
    excludePattern: undefined,
    includePattern: undefined,
    logLevel: DEFAULT_LOG_LEVEL,
    numericParser: DEFAULT_NUMERIC_PARSER,
    outFile: DEFAULT_OUT_FILE,
    overrides: undefined,
    partitions: false,
    print: false,
    runtimeEnums: false,
    runtimeEnumsStyle: undefined,
    schemas: [],
    singular: false,
    typeOnlyImports: true,
    url: DEFAULT_URL,
    verify: false,
  };

  it('should be able to start the CLI', async () => {
    await execa`pnpm build`;
    const binPath = join(process.cwd(), packageJson.bin['kysely-codegen']);
    const output = await execa`node ${binPath} --help`.then((a) => a.stdout);
    deepStrictEqual(output.includes('--help, -h'), true);
  });

  it('should parse options correctly', () => {
    const assert = (args: string[], expectedOptions: Partial<CliOptions>) => {
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

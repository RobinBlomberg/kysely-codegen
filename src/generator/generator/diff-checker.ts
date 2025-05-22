import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export class DiffChecker {
  #sanitize(string: string) {
    // Add `\n` to the end to avoid the "No newline at end of file" warning:
    return `${string.trim()}\n`;
  }

  diff(oldTypes: string, newTypes: string) {
    const temporaryDirectoryPath = mkdtempSync(join(tmpdir(), 'diff-'));

    const oldTypesFilePath = join(temporaryDirectoryPath, 'old-types');
    writeFileSync(oldTypesFilePath, this.#sanitize(oldTypes));

    const newTypesFilePath = join(temporaryDirectoryPath, 'new-types');
    writeFileSync(newTypesFilePath, this.#sanitize(newTypes));

    const { stdout } = spawnSync(
      'git',
      ['diff', '--no-index', oldTypesFilePath, newTypesFilePath],
      { encoding: 'utf-8' },
    );

    rmSync(temporaryDirectoryPath, { recursive: true });

    return stdout.match(/@@.*/s)?.[0];
  }
}

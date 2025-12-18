import gitDiff from 'git-diff';

export class DiffChecker {
  #sanitize(string: string) {
    // Add `\n` to the end to avoid the "No newline at end of file" warning:
    return `${string.trim()}\n`;
  }

  diff(oldTypes: string, newTypes: string) {
    // Force the JS implementation to avoid environment-specific differences
    // (e.g. whether `git` is available / repo detection / shell utilities).
    return gitDiff(this.#sanitize(oldTypes), this.#sanitize(newTypes), {
      forceFake: true,
    });
  }
}

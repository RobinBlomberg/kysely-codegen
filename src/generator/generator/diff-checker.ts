import gitDiff from 'git-diff';

export class DiffChecker {
  #sanitize(string: string) {
    // Add `\n` to the end to avoid the "No newline at end of file" warning:
    return `${string.trim()}\n`;
  }

  diff(oldTypes: string, newTypes: string) {
    return gitDiff(this.#sanitize(oldTypes), this.#sanitize(newTypes));
  }
}

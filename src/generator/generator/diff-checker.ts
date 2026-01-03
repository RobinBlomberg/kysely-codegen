import { createPatch } from 'diff';

export class DiffChecker {
  #sanitize(string: string) {
    // Add `\n` to the end to avoid the "No newline at end of file" warning:
    return `${string.trim()}\n`;
  }

  diff(oldTypes: string, newTypes: string) {
    if (oldTypes === newTypes) return undefined;

    return (
      createPatch('', this.#sanitize(oldTypes), this.#sanitize(newTypes))
        .split('\n')
        // remove header lines
        .slice(4)
        .join('\n')
    );
  }
}

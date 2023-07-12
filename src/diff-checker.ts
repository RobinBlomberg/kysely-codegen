import gitDiff from 'git-diff';

export class DiffChecker {
  #sanitize(s: string) {
    return s.trim();
  }

  diff(oldTypes: string, newTypes: string) {
    const diffResult = gitDiff(
      this.#sanitize(oldTypes),
      this.#sanitize(newTypes),
    );

    return diffResult;
  }
}

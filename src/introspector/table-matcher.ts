import { matcher, Options } from 'micromatch';

const OPTIONS: Options = {
  nocase: true,
};

export class TableMatcher {
  isMatch: (string: string) => boolean;
  isSimpleGlob: boolean;

  constructor(pattern: string) {
    this.isMatch = matcher(pattern, OPTIONS);
    this.isSimpleGlob = !pattern.includes('.');
  }

  match(schema: string | undefined, name: string) {
    const string = this.isSimpleGlob ? name : `${schema ?? '*'}.${name}`;
    return this.isMatch(string);
  }
}

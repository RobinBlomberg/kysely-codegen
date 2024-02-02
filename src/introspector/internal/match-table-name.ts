import micromatch from 'micromatch';

export const matchTableName = (
  schema: string | null,
  name: string,
  pattern: string,
) => {
  const isSimpleGlob = !pattern.includes('.');
  const string = isSimpleGlob ? name : `${schema ?? '*'}.${name}`;
  const match = micromatch.matcher(pattern, { nocase: true });
  return match(string);
};

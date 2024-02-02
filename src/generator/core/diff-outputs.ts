import gitDiff from 'git-diff';

const sanitize = (string: string) => {
  // Add `\n` to the end to avoid "No newline at end of file" warning:
  return `${string.trim()}\n`;
};

export const diffOutputs = (oldTypes: string, newTypes: string) => {
  return gitDiff(sanitize(oldTypes), sanitize(newTypes));
};

import { addSingularRule } from 'pluralize';

const REGEXP_KEY = /^\/(.*)\/(.*)$/;

const addedRules: Record<string, string> = {};

export const addSingularizationRules = (rules: Record<string, string>) => {
  for (const [key, replacement] of Object.entries(rules)) {
    if (addedRules[key] === replacement) {
      continue;
    }

    const regExpMatch = key.match(REGEXP_KEY);
    const rule = regExpMatch
      ? new RegExp(regExpMatch[1]!, regExpMatch[2])
      : key;
    addSingularRule(rule, replacement);
    addedRules[key] = replacement;
  }
};

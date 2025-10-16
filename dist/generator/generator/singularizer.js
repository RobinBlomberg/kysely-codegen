"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSingularizer = void 0;
const REGEXP_KEY = /^\/(.*)\/(.*)$/;
const addSingularizationRules = (pluralize, rules) => {
    const entries = Array.isArray(rules) ? rules : Object.entries(rules);
    for (const [key, replacement] of entries) {
        const regExpMatch = key.match(REGEXP_KEY);
        const rule = regExpMatch
            ? new RegExp(regExpMatch[1], regExpMatch[2])
            : key;
        pluralize.addSingularRule(rule, replacement);
    }
};
const importPluralize = () => {
    const moduleId = Object.values(require.cache).find((module) => {
        return module?.path.endsWith('/pluralize');
    })?.id;
    if (moduleId) {
        delete require.cache[moduleId];
    }
    return require('pluralize');
};
const createSingularizer = (rules) => {
    const pluralize = importPluralize();
    if (typeof rules === 'object') {
        addSingularizationRules(pluralize, rules);
    }
    return pluralize.singular;
};
exports.createSingularizer = createSingularizer;
//# sourceMappingURL=singularizer.js.map
module.exports = {
  camelCase: true,
  defaultSchemas: ['cli'],
  dialect: 'postgres',
  includePattern: 'cli.*',
  logLevel: 'error',
  outFile: './output.snapshot.ts',
  runtimeEnums: 'pascal-case',
  singularize: { '/(bacch)(?:us|i)$/i': '$1us' },
  typeOnlyImports: false,
  url: 'postgres://user:password@localhost:5433/database',
  verify: true,
};

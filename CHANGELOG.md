# kysely-codegen changelog

## 0.9.0

- chore!: upgrade dependencies
  - This means that the generated column order is no longer alphabetical (see https://github.com/koskimas/kysely/pull/262)
- feat!: allow passing database connection to generator
- feat!: generate type-only imports and add `--type-only-imports` CLI option (default: `true`)
- feat!: parse SQLite booleans as numbers - thanks @valtyr!
- chore: update better-sqlite3 peerDependency version - thanks @spa5k!
- fix: remove usage of `RawBuilder`
- test: make tests platform-agnostic (use SQLite `:memory:` connection)

## 0.8.0

- feat: add support for PostgreSQL scalar arrays (e.g. TEXT[]) - thanks @johynpapin!
- feat: include --include-pattern and --exclude-pattern options in programatic API - thanks @antoineneff!
- fix: avoid crash when using programmatic API
- fix: correct camel-case output

## 0.7.0

- build: use looser peer dependency requirement
- feat: add MySQL/PostgreSQL enum support
- feat: add `--include-pattern` and `--exclude-pattern` CLI options

## 0.6.0

### Notable changes

- feat: allow inserting numbers into Decimal fields
- feat: allow RawBuilder in Timestamp fields
- feat: improve `json` and `jsonb` typings

## 0.5.0

### Notable changes

- feat: add camel case support

## 0.4.0

### Notable changes

- build: make kysely a peer dependency
- build: upgrade modules
- feat!: make generated PostgreSQL and SQLite types more accurate
- feat: add MySQL support
- feat: add PostgreSQL schema support
- feat: lazy load database drivers
- feat: make adapters separable from their dialects
- feat: make dialect CLI option optional
- refactor!: remove format CLI option
- refactor: implement new AST-based transformer/serializer
- refactor: export internal modules and make them dependency-injectable
- test: add tests

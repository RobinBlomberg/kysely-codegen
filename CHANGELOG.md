# kysely-codegen changelog

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

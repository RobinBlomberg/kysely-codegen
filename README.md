# ![kysely-codegen](./assets/kysely-codegen-logo.svg) <!-- omit from toc -->

`kysely-codegen` generates Kysely type definitions from your database. That's it.

## Table of contents <!-- omit from toc -->

- [Installation](#installation)
- [Generating type definitions](#generating-type-definitions)
- [Using the type definitions](#using-the-type-definitions)
- [CLI arguments](#cli-arguments) - [Basic example](#basic-example) - [Named imports with aliasing](#named-imports-with-aliasing)
- [Configuration file](#configuration-file)

## Installation

```sh
npm install --save-dev kysely-codegen
```

You will also need to install Kysely with your driver of choice:

```sh
# PostgreSQL
npm install kysely pg

# MySQL
npm install kysely mysql2

# SQLite
npm install kysely better-sqlite3

# MSSQL
npm install kysely tedious tarn @tediousjs/connection-string@0.5.0

# LibSQL
npm install @libsql/kysely-libsql
```

## Generating type definitions

The most convenient way to get started is to create an `.env` file with your database connection string:

```sh
# PostgreSQL
DATABASE_URL=postgres://username:password@yourdomain.com/database

# MySQL
DATABASE_URL=mysql://username:password@yourdomain.com/database

# SQLite
DATABASE_URL=C:/Program Files/sqlite3/db

# MSSQL
DATABASE_URL=Server=mssql;Database=database;User Id=user;Password=password

# LibSQL
DATABASE_URL=libsql://token@host:port/database
```

> If your URL contains a password with special characters, those characters may need to be [percent-encoded](https://en.wikipedia.org/wiki/Percent-encoding#Reserved_characters).
>
> If you are using _PlanetScale_, make sure your URL contains this SSL query string parameter: `ssl={"rejectUnauthorized":true}`

Then run the following command, or add it to the scripts section in your package.json file:

```sh
kysely-codegen
```

This command will generate a `.d.ts` file from your database, for example:

<!-- prettier-ignore -->
```ts
import { ColumnType } from 'kysely';

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Company {
  id: Generated<number>;
  name: string;
}

export interface User {
  company_id: number | null;
  created_at: Generated<Timestamp>;
  email: string;
  id: Generated<number>;
  is_active: boolean;
  name: string;
  updated_at: Timestamp;
}

export interface DB {
  company: Company;
  user: User;
}
```

To specify a different output file:

```sh
kysely-codegen --out-file ./src/db/db.d.ts
```

## Using the type definitions

Import `DB` into `new Kysely<DB>`, and you're done!

```ts
import { Kysely, PostgresDialect } from 'kysely';
import { DB } from 'kysely-codegen';
import { Pool } from 'pg';

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});

const rows = await db.selectFrom('users').selectAll().execute();
//    ^ { created_at: Date; email: string; id: number; ... }[]
```

If you need to use the generated types in e.g. function parameters and type definitions, you may need to use the Kysely `Insertable`, `Selectable`, `Updateable` types. Note that you don't need to explicitly annotate query return values, as it's recommended to let Kysely infer the types for you.

```ts
import { Insertable, Updateable } from 'kysely';
import { DB } from 'kysely-codegen';
import { db } from './db';

async function insertUser(user: Insertable<User>) {
  return await db
    .insertInto('users')
    .values(user)
    .returningAll()
    .executeTakeFirstOrThrow();
  // ^ Selectable<User>
}

async function updateUser(id: number, user: Updateable<User>) {
  return await db
    .updateTable('users')
    .set(user)
    .where('id', '=', id)
    .returning(['email', 'id'])
    .executeTakeFirstOrThrow();
  // ^ { email: string; id: number; }
}
```

Read the [Kysely documentation](https://kysely.dev/docs/getting-started) for more information.

## CLI arguments

#### --camel-case <!-- omit from toc -->

Use the Kysely CamelCasePlugin for generated table column names.

**Example:**

```ts
export interface User {
  companyId: number | null;
  createdAt: Generated<Timestamp>;
  email: string;
  id: Generated<number>;
  isActive: boolean;
  name: string;
  updatedAt: Timestamp;
}
```

#### --config-file <!-- omit from toc -->

Specify the path to the configuration file to use.

#### --custom-imports <!-- omit from toc -->

Specify custom type imports to use with type overrides. This is particularly useful when using custom types from external packages or local files.

##### Basic example

```sh
kysely-codegen --custom-imports='{"InstantRange":"./custom-types","MyCustomType":"@my-org/custom-types"}'
```

##### Named imports with aliasing

You can import specific named exports and optionally alias them using the `#` syntax:

```sh
kysely-codegen --custom-imports='{"MyType":"./types#OriginalType","DateRange":"@org/utils#CustomDateRange"}'
```

This generates:

```ts
import type { OriginalType as MyType } from './types';
import type { CustomDateRange as DateRange } from '@org/utils';
```

Then you can use these imported types in your overrides:

```sh
kysely-codegen --overrides='{"columns":{"events.date_range":"ColumnType<DateRange, DateRange, never>"}}'
```

#### --date-parser <!-- omit from toc -->

Specify which parser to use for PostgreSQL date values. (values: `string`/`timestamp`, default: `timestamp`)

#### --default-schema [value] <!-- omit from toc -->

Set the default schema(s) for the database connection.

Multiple schemas can be specified:

```sh
kysely-codegen --default-schema=public --default-schema=hidden
```

#### --dialect [value] <!-- omit from toc -->

Set the SQL dialect. (values: `postgres`/`mysql`/`sqlite`/`mssql`/`libsql`/`bun-sqlite`/`kysely-bun-sqlite`/`worker-bun-sqlite`)

#### --env-file [value] <!-- omit from toc -->

Specify the path to an environment file to use.

#### --help, -h <!-- omit from toc -->

Print all command line options.

#### --include-pattern [value], --exclude-pattern [value] <!-- omit from toc -->

You can choose which tables should be included during code generation by providing a glob pattern to the `--include-pattern` and `--exclude-pattern` flags. We use [micromatch](https://github.com/micromatch/micromatch) under the hood, which provides advanced glob support. For instance, if you only want to include your public tables:

```sh
kysely-codegen --include-pattern="public.*"
```

You can also include only certain tables within a schema:

```sh
kysely-codegen --include-pattern="public.+(user|post)"
```

Or exclude an entire class of tables:

```sh
kysely-codegen --exclude-pattern="documents.*"
```

#### --log-level [value] <!-- omit from toc -->

Set the terminal log level. (values: `debug`/`info`/`warn`/`error`/`silent`, default: `warn`)

#### --no-domains <!-- omit from toc -->

Skip generating types for PostgreSQL domains. (default: `false`)

#### --numeric-parser <!-- omit from toc -->

Specify which parser to use for PostgreSQL numeric values. (values: `string`/`number`/`number-or-string`, default: `string`)

#### --overrides <!-- omit from toc -->

Specify type overrides for specific table columns in JSON format.

**Example:**

```sh
kysely-codegen --overrides='{"columns":{"table_name.column_name":"{foo:\"bar\"}"}}'
```

#### --out-file [value] <!-- omit from toc -->

Set the file build path. (default: `./node_modules/kysely-codegen/dist/db.d.ts`)

#### --partitions <!-- omit from toc -->

Include partitions of PostgreSQL tables in the generated code.

#### --print <!-- omit from toc -->

Print the generated output to the terminal instead of a file.

#### --runtime-enums <!-- omit from toc -->

The PostgreSQL `--runtime-enums` option generates runtime enums instead of string unions. You can optionally specify which naming convention to use for runtime enum keys. (values: [`pascal-case`, `screaming-snake-case`], default: `screaming-snake-case`)

**Examples:**

`--runtime-enums=false`

```ts
export type Status = 'CONFIRMED' | 'UNCONFIRMED';
```

`--runtime-enums` or `--runtime-enums=screaming-snake-case`

```ts
export enum Status {
  CONFIRMED = 'CONFIRMED',
  UNCONFIRMED = 'UNCONFIRMED',
}
```

`--runtime-enums=pascal-case`

```ts
export enum Status {
  Confirmed = 'CONFIRMED',
  Unconfirmed = 'UNCONFIRMED',
}
```

#### --singularize <!-- omit from toc -->

Singularize generated type aliases, e.g. as `BlogPost` instead of `BlogPosts`. The codegen uses the [pluralize](https://www.npmjs.com/package/pluralize) package for singularization.

You can specify custom singularization rules in the [configuration file](#configuration-file).

#### --type-mapping <!-- omit from toc -->

Specify type mappings for database types, in JSON format. This allows you to automatically map database types to custom TypeScript types.

**Example:**

```sh
kysely-codegen --type-mapping='{"timestamptz":"Temporal.Instant","tstzrange":"InstantRange"}' --custom-imports='{"Temporal":"@js-temporal/polyfill","InstantRange":"./custom-types"}'
```

This is especially useful when you want to use modern JavaScript types like Temporal API instead of Date objects:

```json
{
  "typeMapping": {
    "date": "Temporal.PlainDate",
    "daterange": "DateRange",
    "interval": "Temporal.Duration",
    "time": "Temporal.PlainTime",
    "timestamp": "Temporal.Instant",
    "timestamptz": "Temporal.Instant",
    "tsrange": "InstantRange",
    "tstzrange": "InstantRange"
  }
}
```

Type mappings are automatically applied to all columns of the specified database type, eliminating the need to override each column individually. This feature works with all supported databases, though some types (like PostgreSQL range types) are database-specific.

#### --type-only-imports <!-- omit from toc -->

Generate code using the TypeScript 3.8+ `import type` syntax. (default: `true`)

#### --url [value] <!-- omit from toc -->

Set the database connection string URL. This may point to an environment variable. (default: `env(DATABASE_URL)`)

#### --verify <!-- omit from toc -->

Verify that the generated types are up-to-date. (default: `false`)

## Configuration file

All codegen options can also be configured in a `.kysely-codegenrc.json` (or `.js`, `.ts`, `.yaml` etc.) file or the `kysely-codegen` property in `package.json`. See [Cosmiconfig](https://github.com/cosmiconfig/cosmiconfig) for all available configuration file formats.

The default configuration:

```json
{
  "camelCase": false,
  "customImports": {},
  "dateParser": "timestamp",
  "defaultSchemas": [], // ["public"] for PostgreSQL.
  "dialect": null,
  "domains": true,
  "envFile": null,
  "excludePattern": null,
  "includePattern": null,
  "logLevel": "warn",
  "numericParser": "string",
  "outFile": "./node_modules/kysely-codegen/dist/db.d.ts",
  "overrides": {},
  "partitions": false,
  "print": false,
  "runtimeEnums": false,
  "singularize": false,
  "typeMapping": {},
  "typeOnlyImports": true,
  "url": "env(DATABASE_URL)",
  "verify": false
}
```

The configuration object adds support for more advanced options:

```json
{
  "camelCase": true,
  "customImports": {
    "InstantRange": "./custom-types",
    "MyCustomType": "@my-org/custom-types",
    "AliasedType": "./types#OriginalType"
  },
  "overrides": {
    "columns": {
      "events.date_range": "ColumnType<InstantRange, InstantRange, never>",
      "posts.author_type": "AliasedType",
      "users.settings": "{ theme: 'dark' }"
    }
  },
  "singularize": {
    "/^(.*?)s?$/": "$1_model",
    "/(bacch)(?:us|i)$/i": "$1us"
  },
  "typeMapping": {
    "date": "Temporal.PlainDate",
    "interval": "Temporal.Duration",
    "timestamptz": "Temporal.Instant"
  }
}
```

The generated output:

```ts
import type { InstantRange } from './custom-types';
import type { MyCustomType } from '@my-org/custom-types';
import type { OriginalType as AliasedType } from './types';
import type { Temporal } from '@js-temporal/polyfill';

export interface EventModel {
  createdAt: Temporal.Instant;
  dateRange: ColumnType<InstantRange, InstantRange, never>;
  eventDate: Temporal.PlainDate;
}

export interface UserModel {
  settings: { theme: 'dark' };
}

// ...

export interface DB {
  bacchi: Bacchus;
  events: EventModel;
  users: UserModel;
}
```

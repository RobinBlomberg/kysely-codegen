# ![kysely-codegen](./assets/kysely-codegen-logo.svg) <!-- omit from toc -->

`kysely-codegen` generates Kysely type definitions from your database. That's it.

## Table of contents <!-- omit from toc -->

- [Installation](#installation)
- [Generating type definitions](#generating-type-definitions)
- [Using the type definitions](#using-the-type-definitions)
- [CLI arguments](#cli-arguments)
- [Issue funding](#issue-funding)

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
npm install kysely tedious tarn @tediousjs/connection-string

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

async function updateUser(user: Updateable<User>) {
  return await db
    .updateTable('users')
    .set(user)
    .where({ id: user.id })
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

#### --date-parser <!-- omit from toc -->

Specify which parser to use for PostgreSQL date values. (values: [`string`, `timestamp`], default: `timestamp`)

#### --dialect [value] <!-- omit from toc -->

Set the SQL dialect. (values: [`postgres`, `mysql`, `sqlite`, `mssql`, `libsql`, `bun-sqlite`, `kysely-bun-sqlite`, `worker-bun-sqlite`])

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

Set the terminal log level. (values: [`debug`, `info`, `warn`, `error`, `silent`], default: `warn`)

#### --no-domains <!-- omit from toc -->

Skip generating types for PostgreSQL domains. (default: `false`)

#### --numeric-parser <!-- omit from toc -->

Specify which parser to use for PostgreSQL numeric values. (values: [`string`, `number`, `number-or-string`], default: `string`)

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

#### --runtime-enums, --runtime-enums-style <!-- omit from toc -->

The PostgreSQL `--runtime-enums` option generates runtime enums instead of string unions.

The option `--runtime-enums-style` specifies which naming convention to use for runtime enum keys. (values: [`pascal-case`, `screaming-snake-case`], default: `pascal-case`)

**Examples:**

`--runtime-enums=false`

```ts
export type Status = 'CONFIRMED' | 'UNCONFIRMED';
```

`--runtime-enums`

```ts
export enum Status {
  CONFIRMED = 'CONFIRMED',
  UNCONFIRMED = 'UNCONFIRMED',
}
```

`--runtime-enums --runtime-enums-style=pascal-case`

```ts
export enum Status {
  Confirmed = 'CONFIRMED',
  Unconfirmed = 'UNCONFIRMED',
}
```

#### --schema [value] <!-- omit from toc -->

Set the default schema(s) for the database connection.

Multiple schemas can be specified:

```sh
kysely-codegen --schema=public --schema=hidden
```

#### --singular <!-- omit from toc -->

Singularize generated table names, e.g. `BlogPost` instead of `BlogPosts`. We use the [pluralize](https://www.npmjs.com/package/pluralize) package for singularization.

#### --type-only-imports <!-- omit from toc -->

Generate code using the TypeScript 3.8+ `import type` syntax. (default: `true`)

#### --url [value] <!-- omit from toc -->

Set the database connection string URL. This may point to an environment variable. (default: `env(DATABASE_URL)`)

#### --verify <!-- omit from toc -->

Verify that the generated types are up-to-date. (default: `false`)

## Issue funding

We use [Polar.sh](https://polar.sh/RobinBlomberg) to upvote and promote specific features that you would like to see implemented. Check the backlog and help out:

<a href="https://polar.sh/RobinBlomberg"><img src="https://polar.sh/embed/fund-our-backlog.svg?org=RobinBlomberg" /></a>

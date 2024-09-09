# ![kysely-codegen](./assets/kysely-codegen-logo.svg) <!-- omit from toc -->

`kysely-codegen` generates Kysely type definitions from your database. That's it.

## Table of contents <!-- omit from toc -->

- [Installation](#installation)
- [Generating type definitions](#generating-type-definitions)
- [Include/exclude patterns](#includeexclude-patterns)
- [Help](#help)
- [Using the type definitions](#using-the-type-definitions)
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

Then run:

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

## Include/exclude patterns

You can choose which tables should be included during code generation by providing a glob pattern to the `--include-pattern` and `--exclude-pattern` flags. We use [micromatch](https://github.com/micromatch/micromatch) under the hood which provides advanced glob support. For instance, if you only want to include your public tables:

```bash
kysely-codegen --include-pattern="public.*"
```

You can also include only certain tables within a schema:

```bash
kysely-codegen --include-pattern="public.+(user|post)"
```

Or exclude an entire class of tables:

```bash
kysely-codegen --exclude-pattern="documents.*"
```

## Help

For more options, run `kysely-codegen --help`.

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

const rows = await db.selectFrom('user').selectAll().execute();
//    ^ { company_id: number | null; created_at: Date; email: string; id: number; ... }[]
```

## Issue funding

We use [Polar.sh](https://polar.sh/RobinBlomberg) to upvote and promote specific features that you would like to see implemented. Check the backlog and help out:

<a href="https://polar.sh/RobinBlomberg"><img src="https://polar.sh/embed/fund-our-backlog.svg?org=RobinBlomberg" /></a>

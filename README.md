# ![kysely-codegen](./assets/kysely-codegen-logo.svg) <!-- omit from toc -->

`kysely-codegen` generates Kysely type definitions from your database. That's it.

## Table of contents <!-- omit from toc -->

- [Installation](#installation)
- [Generating type definitions](#generating-type-definitions)
- [Using the type definitions](#using-the-type-definitions)

## Installation

```
npm install --save-dev kysely-codegen

# You will also need to install Kysely with your driver of choice:
npm install kysely pg
npm install kysely mysql2
npm install kysely better-sqlite3
npm install @libsql/kysely-libsql
npm install kysely tedious tarn @tediousjs/connection-string
```

## Generating type definitions

The most convenient way to get started is to create an `.env` file with your database connection string:

```
# PostgreSQL
DATABASE_URL=postgres://username:password@yourdomain.com/database

# MySQL
DATABASE_URL=mysql://username:password@yourdomain.com/database

# SQLite
DATABASE_URL=C:/Program Files/sqlite3/db

# LibSQL
DATABASE_URL=libsql://token@host:port/database

# MSSQL
DATABASE_URL=Server=mssql;Database=database;User Id=user;Password=password
```

> If your URL contains a password with special characters, those characters may need to be [percent-encoded](https://en.wikipedia.org/wiki/Percent-encoding#Reserved_characters).
>
> If you are using _PlanetScale_, make sure your URL contains this SSL query string parameter: `ssl={"rejectUnauthorized":true}`

Then run:

```
kysely-codegen
```

This command will generate a `.d.ts` file from your database, for example:

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

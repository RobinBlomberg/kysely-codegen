# Kysely Codegen

`kysely-codegen` generates Kysely type definitions from your database. That's it.

## Table of contents

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
```

Then run:

```
kysely-codegen
```

This command will generate a `.d.ts` file from your database, for example:

```typescript
import { Generated, ColumnType } from 'kysely';

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

```typescript
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
// [
//   {
//     company_id: number | null;
//     created_at: Date;
//     email: string;
//     id: number;
//     is_active: boolean;
//     name: string;
//     updated_at: Date;
//   }
// ]
```

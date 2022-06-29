# Kysely Codegen

## Installation

```
npm install kysely
npm install --save-dev kysely-codegen

# Then add one of the following drivers:
npm install --save-dev pg
npm install --save-dev better-sqlite3
```

## Generating type definitions

The most convenient way to get started is to create an `.env` file with your database connection string:

```
# Postgres:
DATABASE_URL=postgres://username:password@mydomain.com/database

# SQLite:
DATABASE_URL=C:/Program Files/sqlite3/db
```

And then run:

```
kysely-codegen
```

For more options, run `kysely-codegen --help`.

## Using the type definitions

```typescript
import { Kysely, PostgresDialect } from 'kysely';
import { DB } from 'kysely-codegen';

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    connectionString: process.env.DATABASE_URL,
  }),
});

await db.selectFrom('user').select('email').execute();
```

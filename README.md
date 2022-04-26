# Kysely Codegen

## Installation

```
npm install kysely
npm install --save-dev kysely-codegen

# Then add one of the following drivers:
npm install --save-dev pg
npm install --save-dev better-sqlite3
```

## To generate types:

The most convenient way to get started is to create an `.env` file with your database connection string:

```
DATABASE_URL=postgres://username:password@mydomain.com/database
```

And then run (with your selected dialect):

```
kysely-codegen --dialect=postgres
kysely-codegen --dialect=sqlite
```

For more options, run `kysely-codegen --help`.

## To use:

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

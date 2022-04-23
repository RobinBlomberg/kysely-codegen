# Kysely Codegen

## To generate:

```
kysely-codegen
```

## To use:

```typescript
import { Kysely } from 'kysely';
import { DB } from 'kysely-codegen';

const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    ...
  }),
})
```

import { createConnection } from './create-connection.js';
import type {
  DialectConnector,
  DialectIntrospector,
  KyselyDialectCreator,
} from './types.js';

export type Adapter = {
  connect: DialectConnector;
  createKyselyDialect: KyselyDialectCreator;
  introspect: DialectIntrospector;
};

export type CreateAdapterInput = {
  createKyselyDialect: KyselyDialectCreator;
  introspect: DialectIntrospector;
};

export const createAdapter = (input: CreateAdapterInput) => {
  const adapter: Adapter = {
    connect: async (connectionString) => {
      return await createConnection({
        connectionString,
        createKyselyDialect: adapter.createKyselyDialect,
      });
    },
    createKyselyDialect: input.createKyselyDialect,
    introspect: input.introspect,
  };
  return adapter;
};

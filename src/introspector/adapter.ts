import { createConnection } from './create-connection.js';
import type {
  DialectConnector,
  DialectIntrospector,
  KyselyDialectCreator,
} from './types.js';

export type CreateAdapterInput = {
  createKyselyDialect: KyselyDialectCreator;
  introspect: DialectIntrospector;
};

export type IntrospectorAdapter = {
  connect: DialectConnector;
  createKyselyDialect: KyselyDialectCreator;
  introspect: DialectIntrospector;
};

export const createIntrospectorAdapter = (input: CreateAdapterInput) => {
  const adapter: IntrospectorAdapter = {
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

import { createConnection } from './create-connection.js';
import type {
  DialectConnector,
  DialectIntrospector,
  KyselyDialectFactory,
} from './types.js';

export type CreateAdapterInput = {
  createKyselyDialect: KyselyDialectFactory;
  introspect: DialectIntrospector;
};

export type IntrospectorAdapter = {
  connect: DialectConnector;
  createKyselyDialect: KyselyDialectFactory;
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

import type { Config } from '../../config/config';
import type { DatabaseMetadata } from '../../introspector';

const config: Config = {
  logLevel: 'debug',
  outFile: null,
  serializer: {
    serializeFile(metadata: DatabaseMetadata) {
      return metadata.tables
        .map((table) => {
          return (
            'table ' +
            table.name +
            ' {\n' +
            table.columns
              .map((column) => `  ${column.name}: ${column.dataType}`)
              .join('\n') +
            '\n}'
          );
        })
        .join('\n\n');
    },
  },
  url: 'postgres://user:password@localhost:5433/database',
};

export default config;

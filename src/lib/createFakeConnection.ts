import { stub } from 'sinon';
import * as typeorm from 'typeorm';
import { FakeConnectionManager } from './FakeConnectionManager';

// The fake connection, here we can get the queries and parameters.
export const fakeConnection = {
  query: (query, parameters, cb) => {
    cb(null, {
      rows: 0,
    });
  },
};

const fakeConnectionManager = new FakeConnectionManager();

export const getFakeConnectionManager = () => {
  return fakeConnectionManager;
};

export const createFakeConnection = stub(typeorm, 'createConnection').callsFake(
  async function(optionsOrName: typeorm.ConnectionOptions) {
    const connectionName =
      typeof optionsOrName === 'string' ? optionsOrName : 'default';
    const options =
      optionsOrName instanceof Object
        ? optionsOrName
        : await typeorm.getConnectionOptions(connectionName);
    return getFakeConnectionManager()
      .create(options)
      .connect();
  },
);

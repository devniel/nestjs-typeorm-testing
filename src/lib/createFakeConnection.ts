import * as typeorm from 'typeorm';
import { FakeConnectionManager } from './FakeConnectionManager';
import { DEFAULT_CONNECTION_NAME } from '@nestjs/typeorm/dist/typeorm.constants';

export interface FakeConnectionOptions {
  type: 'postgres';
  name: string;
  entities: (string | Function | typeorm.EntitySchema<any>)[];
}

export const defaultFakeConnectionOptions: FakeConnectionOptions = {
  type: 'postgres',
  name: DEFAULT_CONNECTION_NAME,
  entities: [],
};

// The fake connection attached to the driver and used
// from the master connection to startup queries, no parameters provided;
// The regular one with parameters is the one run by PostgresQueryRunner.
export const fakeConnection = {
  query: (_query, cb) => {
    cb(null, {
      rows: [
        { server_version: "12.0" }
      ]
    });
  },
  // Ignore any event listener action
  on: () => {},
  removeListener: () => {},
};

const fakeConnectionManager = new FakeConnectionManager();

export const getFakeConnectionManager = () => {
  return fakeConnectionManager;
};

export const createFakeConnection = (options: FakeConnectionOptions) =>
  getFakeConnectionManager()
    .create(options as typeorm.ConnectionOptions)
    .connect();

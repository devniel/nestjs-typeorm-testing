import { stub } from 'sinon';
import * as typeorm from 'typeorm';
import { Driver } from 'typeorm/driver/Driver';
import { DriverFactory } from 'typeorm/driver/DriverFactory';
import { PostgresDriver } from 'typeorm/driver/postgres/PostgresDriver';
import { PostgresQueryRunner } from 'typeorm/driver/postgres/PostgresQueryRunner';
import { AlreadyHasActiveConnectionError } from 'typeorm/error/AlreadyHasActiveConnectionError';

/**
 * Based on https://github.com/typeorm/typeorm/issues/1267#issuecomment-456200490
 * and some debugging/reading of the typeorm flow.
 * @author joseym, devniel.
 */

// The fake connection, here we can get the queries and parameters.
export const fakeConnection = {
  query: (query, parameters, cb) => {
    cb(null, {
      rows: 0,
    });
  },
};

// Required when processing new queries
export class FakePostgresQueryRunner extends PostgresQueryRunner {
  release(): Promise<void> {
    return Promise.resolve();
  }
}

export class FakeDBDriver extends PostgresDriver {
  // Returning a fake connection to the master node.
  async connect(): Promise<void> {
    this.master = {
      connect: cb => {
        return cb(null, fakeConnection, {});
      },
    };
    this.database = this.options.database;
  }
  createQueryRunner(mode): PostgresQueryRunner {
    return new FakePostgresQueryRunner(this);
  }
}

// again, just overwriting the driver factory method to connect to fake PG
export class FakeDriverFactory extends DriverFactory {
  create(connection: FakeConnection): Driver {
    return new FakeDBDriver(connection);
  }
}

// Overwriting the connection driver with an accessor to ensure we're using the fake driver.
// Its readonly property value wouldn't allow me to reset this from a child constructor.
export class FakeConnection extends typeorm.Connection {
  _driver: typeorm.Driver;
  get driver(): typeorm.Driver {
    return this._driver;
  }
  set driver(options) {
    this._driver = new FakeDriverFactory().create(this);
  }
}

export class FakeConnectionManager extends typeorm.ConnectionManager {
  // Complete copy from ConnectionManager.connect, but now the Connection class uses the fake driver.
  create(options: typeorm.ConnectionOptions): FakeConnection {
    // check if such connection is already registered
    const existConnection = this.connections.find(
      connection => connection.name === (options.name || 'default'),
    );
    if (existConnection) {
      // if connection is registered and its not closed then throw an error
      if (existConnection.isConnected)
        throw new AlreadyHasActiveConnectionError(options.name || 'default');
      // if its registered but closed then simply remove it from the manager
      this.connections.splice(this.connections.indexOf(existConnection), 1);
    }
    // create a new connection
    const connection = new FakeConnection(options);
    this.connections.push(connection);
    return connection;
  }
}

const fakeConnectionManager = new FakeConnectionManager();

export const getFakeConnectionManager = () => {
  return fakeConnectionManager;
};

// Stubbing out the createConnetion method to ensure that we use our class overrides.
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
